package dev.hexora.payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.*;
import javax.crypto.spec.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
@Component
public class PaymentSecrets {
 private final byte[] key;
 public PaymentSecrets(@Value("${app.payment.encryption-key:${app.jwt.secret}}") String secret) throws Exception {
  if(secret.length()<32)throw new IllegalStateException("Payment encryption key must contain at least 32 characters");
  key=MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
 }
 public String encrypt(String value){try{byte[] iv=new byte[12];new SecureRandom().nextBytes(iv);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));byte[] data=c.doFinal(value.getBytes(StandardCharsets.UTF_8));byte[] out=new byte[12+data.length];System.arraycopy(iv,0,out,0,12);System.arraycopy(data,0,out,12,data.length);return Base64.getEncoder().encodeToString(out);}catch(Exception e){throw new IllegalStateException("Cannot encrypt payment credentials");}}
 public String decrypt(String value){try{byte[] data=Base64.getDecoder().decode(value);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,Arrays.copyOf(data,12)));return new String(c.doFinal(Arrays.copyOfRange(data,12,data.length)),StandardCharsets.UTF_8);}catch(Exception e){throw new IllegalStateException("Cannot decrypt payment credentials; check PAYMENT_ENCRYPTION_KEY");}}
}
