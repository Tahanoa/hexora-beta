package dev.hexora.service;

import org.w3c.dom.*;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.util.*;

/** Static vector icons only; external resources and active SVG are rejected. */
public final class SvgIconSanitizer {
 private SvgIconSanitizer(){}
 private static final Set<String> ELEMENTS=Set.of("svg","g","path","rect","circle","ellipse","line","polyline","polygon","defs","linearGradient","radialGradient","stop","clipPath","mask","use","symbol","title","desc");
 private static final Set<String> ATTRS=Set.of("id","viewBox","width","height","x","y","x1","x2","y1","y2","cx","cy","r","rx","ry","fx","fy","fr","d","points","transform","fill","fill-rule","fill-opacity","stroke","stroke-width","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-dasharray","stroke-dashoffset","stroke-opacity","opacity","color","clip-path","clip-rule","mask","maskUnits","maskContentUnits","gradientUnits","gradientTransform","spreadMethod","offset","stop-color","stop-opacity","preserveAspectRatio","vector-effect","version","href","style","role","focusable","class","aria-hidden","aria-label","aria-labelledby","aria-describedby","data-name");
 private static final Set<String> STYLES=Set.of("fill","fill-rule","fill-opacity","stroke","stroke-width","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-dasharray","stroke-dashoffset","stroke-opacity","opacity","color","clip-path","clip-rule","stop-color","stop-opacity","vector-effect");
 public static byte[] sanitize(byte[] bytes){
  if(bytes.length==0||bytes.length>256*1024)throw new IllegalArgumentException("SVG icons must be under 256 KB");
  try{
   var factory=DocumentBuilderFactory.newInstance();factory.setNamespaceAware(true);
   factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING,true);
   factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
   factory.setFeature("http://xml.org/sax/features/external-general-entities",false);
   factory.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
   factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA,"");factory.setXIncludeAware(false);factory.setExpandEntityReferences(false);
   var builder=factory.newDocumentBuilder();builder.setErrorHandler(new org.xml.sax.helpers.DefaultHandler(){@Override public void fatalError(org.xml.sax.SAXParseException e)throws org.xml.sax.SAXException{throw e;}});
   var document=builder.parse(new ByteArrayInputStream(bytes));var root=document.getDocumentElement();
   if(!"svg".equals(root.getLocalName())||!"http://www.w3.org/2000/svg".equals(root.getNamespaceURI()))throw new IllegalArgumentException("A valid SVG document is required");
   validate(root,0,new int[]{0});
   // Drop processing instructions (including xml-stylesheet) and comments outside the root.
   var outputFactory=DocumentBuilderFactory.newInstance();outputFactory.setNamespaceAware(true);var clean=outputFactory.newDocumentBuilder().newDocument();clean.appendChild(clean.importNode(root,true));
   var tf=TransformerFactory.newInstance();tf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING,true);tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET,"");
   var transformer=tf.newTransformer();transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION,"yes");transformer.setOutputProperty(OutputKeys.ENCODING,"UTF-8");
   var output=new ByteArrayOutputStream();transformer.transform(new DOMSource(clean),new StreamResult(output));return output.toByteArray();
  }catch(IllegalArgumentException e){throw e;}catch(Exception e){throw new IllegalArgumentException("Invalid or unsupported SVG icon");}
 }
 private static void validate(Element element,int depth,int[] count){
  if(depth>40||++count[0]>5000)throw new IllegalArgumentException("SVG icon is too complex");
  if(!"http://www.w3.org/2000/svg".equals(element.getNamespaceURI())||!ELEMENTS.contains(element.getLocalName()))throw new IllegalArgumentException("Only static SVG shapes are supported");
  var attrs=element.getAttributes();for(int i=attrs.getLength()-1;i>=0;i--){var attr=(Attr)attrs.item(i);String name=attr.getLocalName(),value=attr.getValue();
   if(XMLConstants.XMLNS_ATTRIBUTE_NS_URI.equals(attr.getNamespaceURI()))continue;
   if(attr.getNamespaceURI()!=null&&!"http://www.w3.org/1999/xlink".equals(attr.getNamespaceURI()))throw new IllegalArgumentException("Unsupported SVG attribute namespace");
   if(!ATTRS.contains(name)||("http://www.w3.org/1999/xlink".equals(attr.getNamespaceURI())&&!name.equals("href")))throw new IllegalArgumentException("Unsupported SVG attribute: "+name);
   if(name.equals("href")&&!value.matches("#[A-Za-z_][A-Za-z0-9_.:-]*"))throw new IllegalArgumentException("SVG references must stay inside the icon");
   if(name.equals("style")){for(String rule:value.split(";")){if(rule.isBlank())continue;String[] parts=rule.split(":",2);if(parts.length!=2||!STYLES.contains(parts[0].trim()))throw new IllegalArgumentException("Unsupported SVG style");checkValue(parts[1]);}}else checkValue(value);
  }
  for(Node child=element.getFirstChild();child!=null;){Node next=child.getNextSibling();if(child instanceof Element e)validate(e,depth+1,count);else if(child.getNodeType()!=Node.TEXT_NODE&&child.getNodeType()!=Node.CDATA_SECTION_NODE)element.removeChild(child);child=next;}
 }
 private static void checkValue(String value){
  String lower=value.toLowerCase(Locale.ROOT);
  if(lower.contains("javascript:")||lower.contains("data:")||lower.contains("http:")||lower.contains("https:")||value.contains("\\")||value.contains("@")||lower.contains("expression("))throw new IllegalArgumentException("External SVG resources are not supported");
  String withoutLocal=value.replaceAll("(?i)url\\(\\s*#[A-Za-z_][A-Za-z0-9_.:-]*\\s*\\)","");
  if(withoutLocal.toLowerCase(Locale.ROOT).contains("url("))throw new IllegalArgumentException("SVG references must stay inside the icon");
 }
}
