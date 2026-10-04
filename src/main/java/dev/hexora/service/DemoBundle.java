package dev.hexora.service;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.charset.*;
import java.util.*;
import java.util.zip.*;

/** Static package parser; never extracts archive entries to the filesystem. */
public final class DemoBundle {
 public static final int MAX_UPLOAD=10*1024*1024, MAX_FILE=5*1024*1024, MAX_TOTAL=30*1024*1024, MAX_FILES=200;
 private DemoBundle(){}
 private static final Map<String,String> TYPES=Map.ofEntries(
  Map.entry("html","text/html;charset=UTF-8"),Map.entry("htm","text/html;charset=UTF-8"),Map.entry("css","text/css;charset=UTF-8"),
  Map.entry("js","text/javascript;charset=UTF-8"),Map.entry("mjs","text/javascript;charset=UTF-8"),Map.entry("json","application/json"),
  Map.entry("png","image/png"),Map.entry("jpg","image/jpeg"),Map.entry("jpeg","image/jpeg"),Map.entry("gif","image/gif"),
  Map.entry("webp","image/webp"),Map.entry("avif","image/avif"),Map.entry("svg","image/svg+xml"),Map.entry("ico","image/x-icon"),
  Map.entry("woff","font/woff"),Map.entry("woff2","font/woff2"),Map.entry("ttf","font/ttf"),Map.entry("otf","font/otf"),
  Map.entry("txt","text/plain;charset=UTF-8"),Map.entry("mp4","video/mp4"),Map.entry("webm","video/webm"),Map.entry("mp3","audio/mpeg"));
 public record Bundle(Map<String,byte[]> files,String entryPoint,long totalBytes){}
 public static String path(String value){
  if(value==null||value.isBlank()||value.length()>500||value.startsWith("/")||value.contains("\\")||value.contains("%")||value.contains(":")||value.chars().anyMatch(c->c<32||c==127))throw new IllegalArgumentException("Invalid file path");
  for(String part:value.split("/",-1))if(part.isEmpty()||part.equals(".")||part.equals(".."))throw new IllegalArgumentException("Invalid file path");
  return value;
 }
 public static String contentType(String path){String ext=path.substring(path.lastIndexOf('.')+1).toLowerCase(Locale.ROOT);String mime=TYPES.get(ext);if(mime==null)throw new IllegalArgumentException("Unsupported static file: "+path);return mime;}
 public static Bundle read(String filename,byte[] uploaded){
  if(uploaded==null||uploaded.length==0||uploaded.length>MAX_UPLOAD)throw new IllegalArgumentException("Upload HTML or ZIP up to 10 MB");
  String lower=Optional.ofNullable(filename).orElse("").toLowerCase(Locale.ROOT);
  Map<String,byte[]> files=new LinkedHashMap<>();long total=0;
  if(lower.endsWith(".html")||lower.endsWith(".htm")){
   if(uploaded.length>MAX_FILE)throw new IllegalArgumentException("HTML file must be at most 5 MB");files.put("index.html",uploaded);total=uploaded.length;
  }else if(lower.endsWith(".zip")){
   try(var zip=new ZipInputStream(new ByteArrayInputStream(uploaded),StandardCharsets.UTF_8)){
    ZipEntry entry;int entries=0;
    while((entry=zip.getNextEntry())!=null){
     if(++entries>MAX_FILES*2)throw new IllegalArgumentException("Too many archive entries");
     String name=entry.getName();if(entry.isDirectory()){path(name.endsWith("/")?name.substring(0,name.length()-1):name);continue;}
     path(name);contentType(name);if(files.containsKey(name))throw new IllegalArgumentException("Duplicate file path");
     if(files.size()>=MAX_FILES)throw new IllegalArgumentException("A demo supports up to 200 files");
     var bytes=new ByteArrayOutputStream();byte[] buffer=new byte[8192];int length;
     while((length=zip.read(buffer))!=-1){total+=length;if(total>MAX_TOTAL||bytes.size()+length>MAX_FILE)throw new IllegalArgumentException("Expanded ZIP exceeds 30 MB or a file exceeds 5 MB");bytes.write(buffer,0,length);}
     files.put(name,bytes.toByteArray());zip.closeEntry();
    }
   }catch(IOException ex){throw new IllegalArgumentException("Invalid or encrypted ZIP archive",ex);}
   if(!files.containsKey("index.html")&&!files.containsKey("index.htm")&&!files.isEmpty()){
    String first=files.keySet().iterator().next();int slash=first.indexOf('/');
    if(slash>0){String prefix=first.substring(0,slash+1);if(files.keySet().stream().allMatch(x->x.startsWith(prefix))&&(files.containsKey(prefix+"index.html")||files.containsKey(prefix+"index.htm"))){Map<String,byte[]> unwrapped=new LinkedHashMap<>();files.forEach((name,data)->unwrapped.put(name.substring(prefix.length()),data));files=unwrapped;}}
   }
  }else throw new IllegalArgumentException("Only HTML and ZIP uploads are supported");
  String entry=files.containsKey("index.html")?"index.html":"index.htm";
  if(!files.containsKey(entry)||files.get(entry).length==0)throw new IllegalArgumentException("ZIP must contain an index.html or index.htm entry page");
  try{StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(files.get(entry)));}catch(CharacterCodingException ex){throw new IllegalArgumentException("Entry page must use UTF-8");}
  return new Bundle(Collections.unmodifiableMap(files),entry,total);
 }
}
