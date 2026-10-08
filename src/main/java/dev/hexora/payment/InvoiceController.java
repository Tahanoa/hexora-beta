package dev.hexora.payment;
import dev.hexora.dto.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController @RequestMapping("/api/payments/invoices")
public class InvoiceController {
 private final PaymentService service;
 public InvoiceController(PaymentService service){this.service=service;}
 private ResponseEntity<?> response(Object data){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy","no-referrer").body(ApiResponse.success(data));}
 @GetMapping("/{id}") ResponseEntity<?> invoice(@PathVariable UUID id){return response(service.invoice(id.toString()));}
 @PostMapping("/{id}/checkout") ResponseEntity<?> checkout(@PathVariable UUID id,@jakarta.validation.Valid @RequestBody PaymentConsentRequest consent){return response(service.publicCheckout(id.toString(),consent));}
 @PostMapping("/{id}/verify") ResponseEntity<?> verify(@PathVariable UUID id){return response(service.publicVerify(id.toString()));}
}
