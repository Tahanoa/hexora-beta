package dev.hexora.security;
import dev.hexora.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
@Service
public class RequestLimits {
 private final JdbcTemplate jdbc;private final TransactionTemplate transaction;
 public RequestLimits(JdbcTemplate jdbc,PlatformTransactionManager manager){this.jdbc=jdbc;transaction=new TransactionTemplate(manager);transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);}
 private String key(String scope,String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest((scope+":"+value).getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
 public void take(String scope,String value,int maximum,int seconds){
  Integer count=transaction.execute(status->jdbc.queryForObject("insert into request_limits(id,attempts,reset_at) values (?,1,clock_timestamp()+ (? * interval '1 second')) on conflict(id) do update set attempts=case when request_limits.reset_at<=clock_timestamp() then 1 else least(request_limits.attempts+1,1000000) end, reset_at=case when request_limits.reset_at<=clock_timestamp() then excluded.reset_at else request_limits.reset_at end returning attempts",Integer.class,key(scope,value),seconds));
  if(count!=null&&count>maximum)throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many requests; try again later");
 }
 public void checkLogin(String identity){Boolean blocked=jdbc.queryForObject("select exists(select 1 from request_limits where id=? and reset_at>clock_timestamp() and blocked_until>clock_timestamp())",Boolean.class,key("login-failure",identity));if(Boolean.TRUE.equals(blocked))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many login attempts; wait before retrying");}
 public void failedLogin(String identity){transaction.executeWithoutResult(status->jdbc.update("insert into request_limits(id,attempts,reset_at,blocked_until) values (?,1,clock_timestamp()+interval '15 minutes',clock_timestamp()) on conflict(id) do update set attempts=case when request_limits.reset_at<=clock_timestamp() then 1 else least(request_limits.attempts+1,20) end, reset_at=case when request_limits.reset_at<=clock_timestamp() then excluded.reset_at else request_limits.reset_at end, blocked_until=clock_timestamp()+ (case when request_limits.reset_at<=clock_timestamp() or request_limits.attempts<2 then 0 else least(60,power(2,least(request_limits.attempts-1,6))) end * interval '1 second')",key("login-failure",identity)));}
 public void loginSucceeded(String identity){transaction.executeWithoutResult(status->jdbc.update("delete from request_limits where id=?",key("login-failure",identity)));}
 @org.springframework.scheduling.annotation.Scheduled(fixedDelay=3600000,initialDelay=3600000)
 public void cleanup(){jdbc.update("delete from request_limits where reset_at<clock_timestamp()");jdbc.update("delete from revoked_tokens where expires_at<clock_timestamp()");}
}
