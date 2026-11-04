package dev.hexora.service;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
import java.net.URI;
@Service
public class AdminMediaUsage {
 private final JdbcTemplate jdbc;
 public AdminMediaUsage(JdbcTemplate jdbc){this.jdbc=jdbc;}
 public Map<Long,List<Map<String,Object>>> all(){
  Map<Long,List<Map<String,Object>>> result=new LinkedHashMap<>();
  String[][] sources={{"projects","title","image","/manage/projects?edit="},{"services","title","cover","/manage/services?edit="},{"services","title","icon","/manage/services?edit="},{"skills","name","icon","/manage/skills?edit="},{"statistics","title","icon","/manage/statistics?edit="},{"profiles","full_name","profile_image","/profile?edit="},{"testimonials","author_name","avatar","/manage/testimonials?edit="}};
  for(String[] s:sources)jdbc.query("select id,"+s[1]+" as label,"+s[2]+" as value from "+s[0]+" where "+s[2]+" is not null",(org.springframework.jdbc.core.RowCallbackHandler)rs->{String value=rs.getString("value");Long id=mediaId(value);if(id!=null)add(result,id,rs.getString("label"),s[3]+rs.getLong("id"),s[0]);});
  jdbc.query("select id,full_name as label,avatar_id as media_id from profiles where avatar_id is not null",(org.springframework.jdbc.core.RowCallbackHandler)rs->add(result,rs.getLong("media_id"),rs.getString("label"),"/profile","profiles"));
  jdbc.query("select id,title as label,cover_id as media_id from products where cover_id is not null",(org.springframework.jdbc.core.RowCallbackHandler)rs->add(result,rs.getLong("media_id"),rs.getString("label"),"/manage/products?edit="+rs.getLong("id"),"products"));
  return result;
 }
 private void add(Map<Long,List<Map<String,Object>>> result,Long id,String label,String href,String section){var entry=Map.<String,Object>of("label",label==null?section:label,"href",href,"section",section);var list=result.computeIfAbsent(id,k->new ArrayList<>());if(!list.contains(entry))list.add(entry);}
 private Long mediaId(String value){try{String path=URI.create(value.trim()).getPath();if(path!=null&&path.matches("/api/media/public/[1-9][0-9]*"))return Long.valueOf(path.substring(path.lastIndexOf('/')+1));}catch(Exception ignored){}return null;}
}
