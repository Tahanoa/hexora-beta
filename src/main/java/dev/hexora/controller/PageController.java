package dev.hexora.controller;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PageController {
 @GetMapping("/") String publicHome(){return "home/index";}
 @GetMapping("/home") String legacyHome(){return "redirect:/";}
 @GetMapping({"/projects","/services","/skills","/contact"}) String publicSection(jakarta.servlet.http.HttpServletRequest request,Model model){model.addAttribute("publicSection",request.getRequestURI().substring(1));return "home/index";}
 @GetMapping("/about") String biography(jakarta.servlet.http.HttpServletRequest request,Model model){model.addAttribute("publicSection",request.getRequestURI().substring(1));return "home/biography";}
 @GetMapping("/experience") String oldExperience(){return "redirect:/about#career";}
 @GetMapping("/projects/{slug}") String project(@PathVariable String slug,Model model){model.addAttribute("projectSlug",slug);return "home/project";}
 @GetMapping("/collaboration") String collaboration(){return "home/collaboration";}
 @GetMapping("/testimonials") String testimonials(){return "home/testimonials";}
 @GetMapping("/faq") String faq(){return "home/faq";}
 @GetMapping("/login") String login(){return "auth/login";}
 @GetMapping("/register") String register(){return "auth/register";}
 @GetMapping("/dashboard") String dashboard(){return "dashboard/index";}
 @GetMapping("/profile") String profile(){return "dashboard/profile";}
 @GetMapping("/manage/{section}") String manage(@PathVariable String section,Model model){
  if(!java.util.Set.of("testimonials","projects","skills","services","statistics","experience","contact","media","profile").contains(section)) throw new IllegalArgumentException("Invalid section");
  model.addAttribute("section",section);return "dashboard/manage";
 }
}
