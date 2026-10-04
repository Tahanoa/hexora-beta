import dev.hexora.service.DemoBundle;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.*;
public class DemoBundleCheck {
 static byte[] text(String value){return value.getBytes(StandardCharsets.UTF_8);}
 static byte[] zip(Map<String,byte[]> files)throws Exception{var out=new ByteArrayOutputStream();try(var z=new ZipOutputStream(out)){for(var e:files.entrySet()){z.putNextEntry(new ZipEntry(e.getKey()));z.write(e.getValue());z.closeEntry();}}return out.toByteArray();}
 static void check(boolean value){if(!value)throw new AssertionError();}
 static void reject(String name,byte[] data){try{DemoBundle.read(name,data);throw new AssertionError("Accepted invalid bundle: "+name);}catch(IllegalArgumentException expected){}}
 public static void main(String[] args)throws Exception{
  var html=DemoBundle.read("page.html",text("<h1>Hello</h1>"));check(html.entryPoint().equals("index.html"));
  var files=new LinkedHashMap<String,byte[]>();files.put("dist/index.html",text("<script src=\"assets/app.js\"></script>"));files.put("dist/assets/app.js",text("console.log('demo')"));files.put("dist/assets/styles.css",text("body{color:green}"));
  var parsed=DemoBundle.read("demo.zip",zip(files));check(parsed.files().size()==3&&parsed.files().containsKey("assets/app.js"));
  reject("demo.php",text("code"));reject("empty.zip",zip(Map.of("app.js",text("code"))));
  reject("invalid.html",new byte[]{(byte)0xFF});reject("big.html",new byte[DemoBundle.MAX_FILE+1]);
  for(String path:List.of("../secret.txt","/secret.txt","a/../secret.txt","a\\secret.txt","a/%2e%2e/secret.txt","a//file.txt","C:secret.txt")){
   reject("traversal.zip",zip(Map.of("index.html",text("ok"),path,text("bad"))));
  }
  reject("code.zip",zip(Map.of("index.html",text("ok"),"backend.php",text("bad"))));
  reject("bomb.zip",zip(Map.of("index.html",new byte[DemoBundle.MAX_FILE+1])));
  var many=new LinkedHashMap<String,byte[]>();many.put("index.html",text("ok"));for(int i=0;i<DemoBundle.MAX_FILES;i++)many.put("f"+i+".txt",text("ok"));reject("many.zip",zip(many));
  check(DemoBundle.contentType("app.mjs").startsWith("text/javascript"));
  System.out.println("DemoBundle: HTML, nested assets, folder unwrap, UTF-8, traversal, executable files, expansion and count limits passed.");
 }
}
