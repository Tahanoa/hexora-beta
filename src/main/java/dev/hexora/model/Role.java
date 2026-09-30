package dev.hexora.model;
import dev.hexora.enums.RoleType;
import jakarta.persistence.*;
@Entity @Table(name="roles")
public class Role extends BaseEntity {
 @Enumerated(EnumType.STRING) @Column(nullable=false, unique=true, length=30) private RoleType name;
 public RoleType getName(){return name;} public void setName(RoleType name){this.name=name;}
}
