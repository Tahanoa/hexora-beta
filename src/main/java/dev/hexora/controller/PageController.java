package dev.hexora.controller;
import org.springframework.stereotype.Controller; import org.springframework.web.bind.annotation.GetMapping;
@Controller public class PageController { @GetMapping({"/","/home"}) String home(){return "home/index";} @GetMapping("/login") String login(){return "auth/login";} @GetMapping("/register") String register(){return "auth/register";} @GetMapping({"/dashboard","/profile"}) String dashboard(){return "dashboard/index";} }
