package dev.hexora.payment;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PaymentCallbackController {
 private final PaymentService service;
 public PaymentCallbackController(PaymentService service){this.service=service;}
 @GetMapping("/api/payments/callback") String callback(@RequestParam("Authority") String authority,@RequestParam("Status") String status,Model model){model.addAttribute("payment",service.callback(authority,status));return "dashboard/payment-result";}
 @GetMapping("/payments") String mine(Model model){model.addAttribute("adminPayments",false);return "dashboard/payments";}
}
