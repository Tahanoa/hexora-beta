package dev.hexora.controller;
import dev.hexora.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
@RestController @RequestMapping("/api/admin/workspace") @PreAuthorize("hasRole('ADMIN')")
public class AdminWorkspaceController {
 private final JdbcTemplate jdbc;
 public AdminWorkspaceController(JdbcTemplate jdbc){this.jdbc=jdbc;}
 @GetMapping Object overview(){
  var counts=new LinkedHashMap<String,Object>();
  counts.put("unread",jdbc.queryForObject("select count(*) from chat_messages where from_admin=false and read_by_recipient=false",Long.class));
  counts.put("waiting",jdbc.queryForObject("select count(*) from chat_messages m where m.from_admin=false and m.id=(select max(x.id) from chat_messages x where x.user_id=m.user_id)",Long.class));
  counts.put("requests",jdbc.queryForObject("select count(distinct m.user_id) from chat_messages m where m.from_admin=false and m.text like 'درخواست خدمت:%' and not exists(select 1 from chat_messages a where a.user_id=m.user_id and a.from_admin=true and a.id>m.id)",Long.class));
  var drafts=new ArrayList<Map<String,Object>>();
  for(String[] s:new String[][]{{"services","title","published=false","/manage/services?edit="},{"testimonials","author_name","published=false","/manage/testimonials?edit="},{"products","title","published=false and deleted=false","/manage/products?edit="},{"demo_sites","title","published_version_id is null","/manage/demos?edit="}}){
   Long count=jdbc.queryForObject("select count(*) from "+s[0]+" where "+s[2],Long.class);counts.put(s[0]+"Drafts",count);
   jdbc.query("select id,"+s[1]+" as label from "+s[0]+" where "+s[2]+" order by id desc limit 5",(org.springframework.jdbc.core.RowCallbackHandler)rs->drafts.add(Map.of("id",rs.getLong("id"),"title",rs.getString("label"),"section",s[0],"href",s[3]+rs.getLong("id"))));
  }
  var conversations=jdbc.queryForList("select m.user_id as \"userId\",u.username,m.text as \"lastMessage\",m.created_at as \"updatedAt\" from chat_messages m join users u on u.id=m.user_id where m.from_admin=false and m.id=(select max(x.id) from chat_messages x where x.user_id=m.user_id) order by m.id desc limit 6");
  return ApiResponse.success(Map.of("counts",counts,"drafts",drafts,"conversations",conversations));
 }
}
