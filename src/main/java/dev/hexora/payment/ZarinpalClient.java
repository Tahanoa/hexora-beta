package dev.hexora.payment;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.util.*;
@Component
public class ZarinpalClient {
 private final RestClient client;
 public ZarinpalClient(){var factory=new SimpleClientHttpRequestFactory();factory.setConnectTimeout(5000);factory.setReadTimeout(15000);client=RestClient.builder().baseUrl("https://payment.zarinpal.com/pg/v4/payment/").requestFactory(factory).build();}
 public record Result(int code,Map<String,Object> data) {}
 public Result call(String method,Map<String,Object> payload){
  try{Map<?,?> body=client.post().uri(method+".json").contentType(org.springframework.http.MediaType.APPLICATION_JSON).body(payload).retrieve().onStatus(status -> status.isError(), (request,response) -> {}).body(Map.class);
   if(body==null)return new Result(-999,Map.of());
   Object raw=body.get("data");Map<String,Object> data=raw instanceof Map ? (Map<String,Object>)raw : Map.of();
   if(data.containsKey("code"))return new Result(Integer.parseInt(data.get("code").toString()),data);
   Object errors=body.get("errors");if(errors instanceof Map<?,?> e && e.get("code")!=null)return new Result(Integer.parseInt(e.get("code").toString()),Map.of());
   return new Result(-999,Map.of());
  }catch(Exception e){return new Result(-999,Map.of());}
 }
}
