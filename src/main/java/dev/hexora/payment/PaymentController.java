package dev.hexora.payment;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.security.Principal;
import java.time.LocalDate;
@RestController @RequestMapping("/api/payments")
public class PaymentController {
 private final PaymentService service;
 public PaymentController(PaymentService service){this.service=service;}
 public record SettingsRequest(boolean enabled,@Size(max=36) String merchantId,@NotBlank @Size(max=500) String callbackUrl){}
 public record InvoiceRequest(@NotBlank @Size(max=50) String buyer,@Min(1000) @Max(1000000000) long amount,@NotBlank @Size(max=250) String description){}
 @GetMapping("/admin/settings") @PreAuthorize("hasRole('ADMIN')") Object settings(){return ApiResponse.success(service.settingsView());}
 @PutMapping("/admin/settings") @PreAuthorize("hasRole('ADMIN')") Object save(@Valid @RequestBody SettingsRequest r){return ApiResponse.success(service.saveSettings(r.enabled(),r.merchantId(),r.callbackUrl()));}
 @PostMapping("/admin/invoices") @PreAuthorize("hasRole('ADMIN')") Object create(@Valid @RequestBody InvoiceRequest r){return ApiResponse.created(service.create(r.buyer(),r.amount(),r.description()));}
 @GetMapping("/admin/transactions") @PreAuthorize("hasRole('ADMIN')") Object list(@RequestParam(required=false) String status,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(null,status,page));}
 @GetMapping("/admin/report") @PreAuthorize("hasRole('ADMIN')") Object report(@RequestParam LocalDate from,@RequestParam LocalDate to){return ApiResponse.success(service.report(from,to));}
 @PostMapping("/admin/transactions/{id}/verify") @PreAuthorize("hasRole('ADMIN')") Object verify(@PathVariable String id){return ApiResponse.success(service.verify(id));}
 @PostMapping("/admin/reconcile") @PreAuthorize("hasRole('ADMIN')") Object reconcile(){return ApiResponse.success(service.reconcile());}
 @GetMapping("/mine") @PreAuthorize("isAuthenticated()") Object mine(Principal user,@RequestParam(defaultValue="0") int page){return ApiResponse.success(service.list(user.getName(),null,page));}
 @PostMapping("/{id}/verify") @PreAuthorize("isAuthenticated()") Object verifyMine(@PathVariable String id,Principal user){return ApiResponse.success(service.verifyMine(id,user.getName()));}
 @PostMapping("/{id}/checkout") @PreAuthorize("isAuthenticated()") Object checkout(@PathVariable String id,Principal user){return ApiResponse.success(service.checkout(id,user.getName()));}
}
