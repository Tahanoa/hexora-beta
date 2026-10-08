package dev.hexora.payment;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.time.LocalDate;
@RestController @RequestMapping("/api/payments")
public class PaymentController {
 private final PaymentService service;
 public PaymentController(PaymentService service){this.service=service;}
 public record SettingsRequest(boolean enabled,@Size(max=36) String merchantId,@NotBlank @Size(max=500) String callbackUrl){}
 public record InvoiceRequest(@Min(1000) @Max(1000000000) long amount,@NotBlank @Size(max=250) String description){}
 @GetMapping("/admin/settings") @PreAuthorize("hasRole('ADMIN')") Object settings(){return ApiResponse.success(service.settingsView());}
 @PutMapping("/admin/settings") @PreAuthorize("hasRole('ADMIN')") Object save(@Valid @RequestBody SettingsRequest r){return ApiResponse.success(service.saveSettings(r.enabled(),r.merchantId(),r.callbackUrl()));}
 @PostMapping("/admin/invoices") @PreAuthorize("hasRole('ADMIN')") Object create(@Valid @RequestBody InvoiceRequest r){return ApiResponse.created(service.create(r.amount(),r.description()));}
 @GetMapping("/admin/transactions") @PreAuthorize("hasRole('ADMIN')") Object list(@RequestParam(required=false) String status,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(status,page));}
 @GetMapping("/admin/report") @PreAuthorize("hasRole('ADMIN')") Object report(@RequestParam LocalDate from,@RequestParam LocalDate to){return ApiResponse.success(service.report(from,to));}
 @PostMapping("/admin/transactions/{id}/verify") @PreAuthorize("hasRole('ADMIN')") Object verify(@PathVariable String id){return ApiResponse.success(service.verify(id));}
 @DeleteMapping("/admin/transactions/{id}") @PreAuthorize("hasRole('ADMIN')") Object delete(@PathVariable java.util.UUID id){return ApiResponse.success(service.deleteInvoice(id.toString()));}
 @PostMapping("/admin/reconcile") @PreAuthorize("hasRole('ADMIN')") Object reconcile(){return ApiResponse.success(service.reconcile());}
}
