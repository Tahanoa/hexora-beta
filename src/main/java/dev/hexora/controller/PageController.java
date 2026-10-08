package dev.hexora.controller;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PageController {
 @GetMapping("/") String publicHome(){return "home/index";}
 @GetMapping("/home") String legacyHome(){return "redirect:/";}
 @GetMapping("/projects") String projects(Model model){model.addAttribute("publicSection","projects");return "portfolio";}
 @GetMapping("/products") String productCatalog(){return "home/products";}
 @GetMapping("/products/library") String productLibrary(){return "redirect:/account/products";}
 @GetMapping("/account") String account(Model model){model.addAttribute("accountSection","overview");return "account/index";}
 @GetMapping("/account/{section}") String accountSection(@PathVariable String section,Model model){if(!java.util.Set.of("orders","products").contains(section))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);model.addAttribute("accountSection",section);return "account/index";}
 @GetMapping("/account/orders/{id}") String productInvoice(@PathVariable java.util.UUID id,Model model,jakarta.servlet.http.HttpServletResponse response){model.addAttribute("invoiceId",id.toString());model.addAttribute("productInvoice",true);response.setHeader("Cache-Control","no-store");response.setHeader("Referrer-Policy","no-referrer");return "home/invoice";}
 @GetMapping("/products/{slug}") String productDetail(@PathVariable String slug,Model model){model.addAttribute("productSlug",slug);return "home/products";}
 @GetMapping("/services") String services(){return "home/services";}
 @GetMapping("/services/{slug}") String serviceDetail(@PathVariable String slug,Model model){model.addAttribute("serviceSlug",slug);return "home/service";}
 @GetMapping("/skills") String publicSection(jakarta.servlet.http.HttpServletRequest request,Model model){model.addAttribute("publicSection",request.getRequestURI().substring(1));return "home/index";}
 @GetMapping("/about") String biography(jakarta.servlet.http.HttpServletRequest request,Model model){model.addAttribute("publicSection",request.getRequestURI().substring(1));return "home/biography";}
 @GetMapping("/experience") String oldExperience(){return "redirect:/about#career";}
 @GetMapping("/projects/{slug}") String project(@PathVariable String slug,Model model){model.addAttribute("projectSlug",slug);return "home/project";}
 @GetMapping("/collaboration") String collaboration(){return "home/collaboration";}
 @GetMapping("/contact") String contact(){return "home/contact";}
 @GetMapping("/testimonials") String testimonials(){return "home/testimonials";}
 @GetMapping("/terms") String terms(){return "home/terms";}
 @GetMapping("/privacy") String privacy(){return "home/privacy";}
 @GetMapping("/faq") String faq(){return "home/faq";}
 @GetMapping("/login") String login(){return "auth/login";}
 @GetMapping("/register") String register(){return "auth/register";}
 @GetMapping("/dashboard") String dashboard(){return "dashboard/index";}
 @GetMapping("/profile") String profile(){return "dashboard/profile";}
 @GetMapping("/manage/{section}") String manage(@PathVariable String section,Model model){
  if(!java.util.Set.of("products","payments","demos","testimonials","projects","skills","services","statistics","experience","contact","media","profile").contains(section)) throw new IllegalArgumentException("Invalid section");
  if(section.equals("products"))return "dashboard/products";
  if(section.equals("payments"))return "dashboard/payments";
  if(section.equals("demos"))return "dashboard/demos";
  if(section.equals("contact"))return "dashboard/chat";
  if(section.equals("media"))return "dashboard/media";
  model.addAttribute("section",section);return "dashboard/manage";
 }
}
