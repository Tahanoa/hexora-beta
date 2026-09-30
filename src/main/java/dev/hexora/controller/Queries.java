package dev.hexora.controller;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.*;
public final class Queries {
 private Queries(){}
 public static Pageable page(int page,int size,String sort,String direction,Set<String> fields){
  if(page<0||size<1||size>100||!fields.contains(sort)||!Set.of("asc","desc").contains(direction.toLowerCase(Locale.ROOT))) throw new IllegalArgumentException("Invalid pagination");
  return PageRequest.of(page,size,Sort.by(Sort.Direction.fromString(direction),sort).and(Sort.by("id")));
 }
 public static <T> Specification<T> search(String keyword,String...fields){
  if(keyword==null||keyword.length()>200) throw new IllegalArgumentException("Invalid search");
  String pattern="%"+keyword.toLowerCase(Locale.ROOT).replace("\\","\\\\").replace("%","\\%").replace("_","\\_")+"%";
  return (root,query,cb)->cb.or(Arrays.stream(fields).map(f->cb.like(cb.lower(root.get(f)),pattern,'\\')).toArray(jakarta.persistence.criteria.Predicate[]::new));
 }
 public static <E extends Enum<E>> E enumValue(Class<E> type,String value){return Enum.valueOf(type,value.toUpperCase(Locale.ROOT));}
}
