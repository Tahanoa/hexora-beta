package dev.hexora.controller;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
@Controller
public class PageController {
 @GetMapping("/") String publicHome(){return "portfolio";}
 @GetMapping("/home") String home(){return "home/index";}
 @GetMapping("/login") String login(){return "auth/login";}
 @GetMapping("/register") String register(){return "auth/register";}
 @GetMapping("/dashboard") String dashboard(){return "dashboard/index";}
 @GetMapping("/profile") String profile(){return "dashboard/profile";}
 @GetMapping("/manage/{section}") String manage(@PathVariable String section,Model model){
  if(!java.util.Set.of("projects","skills","services","statistics","experience","contact","media","profile").contains(section)) throw new IllegalArgumentException("Invalid section");
  model.addAttribute("section",section);return "dashboard/manage";
 }
}
