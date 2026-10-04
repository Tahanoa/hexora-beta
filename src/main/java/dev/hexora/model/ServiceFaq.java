package dev.hexora.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Embeddable
public class ServiceFaq {
 @NotBlank @Size(max=500) @Column(columnDefinition="TEXT") private String question;
 @NotBlank @Size(max=5000) @Column(columnDefinition="TEXT") private String answer;
 public ServiceFaq(){}
 public String getQuestion(){return question;} public void setQuestion(String value){question=value;}
 public String getAnswer(){return answer;} public void setAnswer(String value){answer=value;}
}
