package dev.hexora.payment;
import dev.hexora.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import java.util.*;
import java.time.*;
import java.net.URI;
@Service
public class PaymentService {
 public static final String TERMS_VERSION="2026-10-09";
 private final PaymentRepository payments;private final GatewayRepository gateways;private final PaymentSecrets secrets;private final ZarinpalClient client;
 public PaymentService(PaymentRepository p,GatewayRepository g,PaymentSecrets s,ZarinpalClient c){payments=p;gateways=g;secrets=s;client=c;}
 public GatewaySettings settings(){return gateways.findById(1L).orElseGet(GatewaySettings::new);}
 public Map<String,Object> settingsView(){var s=settings();return Map.of("enabled",s.enabled,"merchantConfigured",s.merchantEncrypted!=null,"callbackUrl",s.callbackUrl==null?"":s.callbackUrl,"currency","IRT");}
 @Transactional public Object saveSettings(boolean enabled,String merchant,String callback){
  URI url;try{url=URI.create(callback);}catch(Exception e){throw bad("Invalid callback URL");}
  if(!"https".equals(url.getScheme())||url.getHost()==null||url.getUserInfo()!=null||url.getQuery()!=null||url.getFragment()!=null||!"/api/payments/callback".equals(url.getPath()))throw bad("Use an HTTPS callback URL ending with /api/payments/callback");
  var s=settings();if(merchant!=null&&!merchant.isBlank()){try{if(merchant.length()!=36)throw new IllegalArgumentException();UUID.fromString(merchant);}catch(Exception e){throw bad("Invalid merchant ID");}s.merchantEncrypted=secrets.encrypt(merchant);}
  if(enabled&&s.merchantEncrypted==null)throw bad("Merchant ID is required");s.enabled=enabled;s.callbackUrl=callback;gateways.saveAndFlush(s);return settingsView();
 }
 @Transactional public Object create(long amount,String description){var p=new Payment();p.amount=amount;p.description=description;return view(payments.saveAndFlush(p));}
 public Map<String,Object> view(Payment p){var m=new LinkedHashMap<String,Object>();m.put("id",p.id);m.put("deleted",p.deleted);m.put("invoiceType",p.invoiceType());m.put("shareable",p.isShareable());m.put("invoicePath",p.isShareable()?"/invoice/"+p.id:"/account/orders/"+p.id);m.put("productId",p.productId);m.put("description",p.description);m.put("amount",p.amount);m.put("currency","IRT");m.put("status",p.status);m.put("authority",p.authority);m.put("refId",p.refId);m.put("cardPan",p.cardPan);m.put("fee",p.fee);m.put("gatewayCode",p.gatewayCode);m.put("error",p.error);m.put("createdAt",p.createdAt);m.put("paidAt",p.paidAt);return m;}
 public Map<String,Object> invoiceView(Payment p){var m=new LinkedHashMap<String,Object>();m.put("id",p.id);m.put("deleted",p.deleted);m.put("invoiceType",p.invoiceType());m.put("shareable",p.isShareable());m.put("description",p.description);m.put("amount",p.amount);m.put("status",p.status);m.put("refId",p.refId);m.put("createdAt",p.createdAt);m.put("paidAt",p.paidAt);m.put("termsVersion",TERMS_VERSION);return m;}
 public void acceptTerms(Payment p,PaymentConsentRequest consent){if(consent==null||!consent.accepted()||!TERMS_VERSION.equals(consent.termsVersion()))throw bad("Read and accept the current privacy, security and purchase terms before payment");p.termsAcceptedAt=Instant.now();p.termsVersion=TERMS_VERSION;}
 private Payment direct(Payment p){if(p.deleted||!p.isShareable())throw ApiException.notFound();return p;}
 public Object invoice(String id){return invoiceView(direct(payments.findById(id).orElseThrow(ApiException::notFound)));}
 @Transactional public Object publicCheckout(String id,PaymentConsentRequest consent){var invoice=direct(lock(id));acceptTerms(invoice,consent);var result=(Map<String,Object>)checkout(id);var p=payments.findById(id).orElseThrow(ApiException::notFound);var out=invoiceView(p);if(result.containsKey("redirectUrl"))out.put("redirectUrl",result.get("redirectUrl"));return out;}
 @Transactional public Object publicVerify(String id){var p=direct(lock(id));verifyLocked(p);return invoiceView(p);}
 public Object list(String status,int page){var paging=PageRequest.of(Math.max(0,page),20,Sort.by("createdAt").descending());return (status!=null&&!status.isBlank()?payments.findByStatusAndDeletedFalse(status,paging):payments.findByDeletedFalse(paging)).map(this::view);}
 private Payment lock(String id){return payments.locked(id).orElseThrow(ApiException::notFound);}
 @Transactional public Object checkout(String id){
  var p=lock(id);
  if(p.deleted)throw ApiException.notFound();
  if(p.status.equals("PAID"))return view(p);
  if(p.termsAcceptedAt==null||!TERMS_VERSION.equals(p.termsVersion))throw bad("Purchase terms must be accepted before payment");
  if(p.authority!=null){var result=view(p);result.put("redirectUrl","https://payment.zarinpal.com/pg/StartPay/"+p.authority);return result;}
  if(p.lastRequestAt!=null&&p.lastRequestAt.isAfter(Instant.now().minusSeconds(5)))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Wait a few seconds before retrying payment");
  p.lastRequestAt=Instant.now();
  var s=settings();if(!s.enabled||s.merchantEncrypted==null)throw bad("Payment gateway is disabled");
  var metadata=Map.of("order_id",p.id);
  p.merchantEncrypted=s.merchantEncrypted;
  var r=client.call("request",Map.of("merchant_id",secrets.decrypt(p.merchantEncrypted),"amount",p.amount,"currency","IRT","description",p.description,"callback_url",s.callbackUrl,"metadata",metadata));
  p.gatewayCode=r.code();Object authority=r.data().get("authority");
  if(r.code()==100&&authority!=null&&authority.toString().matches("[A-Za-z0-9]{36}")){p.authority=authority.toString();p.status="PENDING";p.error=null;}else{p.status="REQUEST_FAILED";p.error=r.code()==-999?"Gateway unavailable; try again":"Gateway request rejected ("+r.code()+")";}
  payments.saveAndFlush(p);var result=view(p);if(p.authority!=null)result.put("redirectUrl","https://payment.zarinpal.com/pg/StartPay/"+p.authority);return result;
 }
 @Transactional public Object callback(String authority,String status){var p=payments.lockedByAuthority(authority).orElseThrow(ApiException::notFound);if(p.status.equals("PAID"))return view(p);
  // A browser callback is not proof of failure or payment. Keep the authority available for recovery.
  if(!"OK".equals(status)){p.error="Payment was cancelled or not completed";return view(p);}return verifyLocked(p);
 }
 private Object verifyLocked(Payment p){if(p.status.equals("PAID"))return view(p);if(p.authority==null)throw bad("No gateway authority to verify");
  if(p.lastVerifyAt!=null&&p.lastVerifyAt.isAfter(Instant.now().minusSeconds(5)))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Wait a few seconds before retrying verification");
  p.lastVerifyAt=Instant.now();
  var r=client.call("verify",Map.of("merchant_id",secrets.decrypt(p.merchantEncrypted),"amount",p.amount,"authority",p.authority));p.gatewayCode=r.code();
  Object ref=r.data().get("ref_id");if((r.code()==100||r.code()==101)&&ref!=null&&ref.toString().matches("[1-9][0-9]*")){p.status="PAID";p.refId=ref.toString();p.paidAt=Instant.now();p.cardPan=Objects.toString(r.data().get("card_pan"),null);if(r.data().get("fee") instanceof Number fee)p.fee=fee.longValue();p.error=null;}else{p.error=r.code()==-999?"Verification unavailable; retry later":"Payment not verified ("+r.code()+")";}
  payments.saveAndFlush(p);return view(p);
 }
 @Transactional public Object verify(String id){return verifyLocked(lock(id));}
 @Transactional public Object reconcile(){var s=settings();if(s.merchantEncrypted==null)throw bad("Merchant ID is required");var r=client.call("unVerified",Map.of("merchant_id",secrets.decrypt(s.merchantEncrypted)));if(r.code()!=100)throw bad("Cannot retrieve unverified payments ("+r.code()+")");var results=new ArrayList<Object>();Object raw=r.data().get("authorities");if(raw instanceof List<?> list)for(Object item:list){if(item instanceof Map<?,?> entry){var p=payments.lockedByAuthority(Objects.toString(entry.get("authority"),""));if(p.isPresent())results.add(verifyLocked(p.get()));}}return results;}
 @Transactional public Object deleteInvoice(String id){var p=lock(id);p.deleted=true;payments.saveAndFlush(p);return Map.of("deleted",true);}
 public Object report(LocalDate from,LocalDate to){if(to.isBefore(from)||java.time.temporal.ChronoUnit.DAYS.between(from,to)>365)throw bad("Choose a date range of up to one year");var zone=ZoneId.of("Asia/Tehran");var start=from.atStartOfDay(zone).toInstant();var end=to.plusDays(1).atStartOfDay(zone).toInstant();var total=payments.totals(start,end).get(0);var statuses=new LinkedHashMap<String,Long>();for(var row:payments.statuses(start,end))statuses.put(row[0].toString(),((Number)row[1]).longValue());var days=new HashMap<String,Object[]>();for(var row:payments.daily(start,end))days.put(row[0].toString(),row);var trend=new ArrayList<Object>();for(var d=from;!d.isAfter(to);d=d.plusDays(1)){var row=days.get(d.toString());trend.add(Map.of("date",d.toString(),"revenue",row==null?0:row[1],"count",row==null?0:row[2]));}return Map.of("revenue",total[0],"fees",total[1],"paidCount",total[2],"statuses",statuses,"daily",trend,"currency","IRT");}
 private ApiException bad(String message){return new ApiException(HttpStatus.BAD_REQUEST,message);}
}
