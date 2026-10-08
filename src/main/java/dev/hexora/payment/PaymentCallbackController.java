package dev.hexora.payment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PaymentCallbackController {
 private final PaymentService service;
 public PaymentCallbackController(PaymentService service){this.service=service;}
 @GetMapping("/api/payments/callback") String callback(@RequestParam("Authority") String authority,@RequestParam("Status") String status,Model model){model.addAttribute("payment",service.callback(authority,status));return "dashboard/payment-result";}
 @GetMapping("/invoice/{id}") String invoice(@PathVariable java.util.UUID id,Model model,jakarta.servlet.http.HttpServletResponse response){
  service.invoice(id.toString());model.addAttribute("invoiceId",id.toString());response.setHeader("Cache-Control","no-store");response.setHeader("Referrer-Policy","no-referrer");return "dashboard/invoice";
 }
}
