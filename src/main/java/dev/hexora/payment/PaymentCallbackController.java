package dev.hexora.payment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PaymentCallbackController {
 private final PaymentService service;
 public PaymentCallbackController(PaymentService service){this.service=service;}
 @GetMapping("/api/payments/callback") String callback(@RequestParam("Authority") String authority,@RequestParam("Status") String status,Model model,jakarta.servlet.http.HttpServletResponse response){response.setHeader("Cache-Control","no-store");response.setHeader("Referrer-Policy","no-referrer");var payment=(java.util.Map<?,?>)service.callback(authority,status);if(payment.get("productId")!=null)return "redirect:/account/orders/"+payment.get("id");model.addAttribute("invoiceId",payment.get("id"));return "home/invoice";}
 @GetMapping("/invoice/{id}") String invoice(@PathVariable java.util.UUID id,Model model,jakarta.servlet.http.HttpServletResponse response){
  service.invoice(id.toString());model.addAttribute("invoiceId",id.toString());response.setHeader("Cache-Control","no-store");response.setHeader("Referrer-Policy","no-referrer");return "home/invoice";
 }
}
