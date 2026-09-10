import { commonsImageCandidate, createExpressResearchResult, type ExpressResearchImage, type ExpressResearchPage } from "@/lib/express-research";
import type { ResearchDepth } from "@/lib/masterprompt-engine";
import { extractWebsiteResearchDossier, normalizeOfficialWebsiteUrl, websiteHostSafety } from "@/lib/website-quality";
import type { Business } from "@/lib/webworkbalance";
const MAX_HTML_BYTES=1_250_000,FETCH_TIMEOUT_MS=10_000;
const DEPTH_PAGES:Record<ResearchDepth,number>={quick:1,standard:4,deep:7,maximum:10};
class ResearchFetchError extends Error{}
const value=(input:unknown,max:number)=>typeof input==="string"?input.trim().slice(0,max):"";
function sanitizeBusiness(input:unknown):Pick<Business,"name"|"category"|"address"|"website">|null{
 if(!input||typeof input!=="object"||Array.isArray(input))return null;const raw=input as Partial<Business>,name=value(raw.name,240);if(!name)return null;
 return {name,category:value(raw.category,240)||"Lokales Unternehmen",address:value(raw.address,500),website:value(raw.website,1000)||null};
}
async function readHtml(response:Response){
 if(!response.body)return "";const reader=response.body.getReader(),chunks:Uint8Array[]=[];let length=0;
 while(true){const {value:chunk,done}=await reader.read();if(done)break;if(!chunk)continue;length+=chunk.byteLength;if(length>MAX_HTML_BYTES){await reader.cancel();throw new ResearchFetchError("Seite für den sicheren Recherchelauf zu groß");}chunks.push(chunk);}
 const merged=new Uint8Array(length);let offset=0;for(const chunk of chunks){merged.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(merged);
}
async function fetchHtml(initialUrl:URL,expectedHost?:string){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),FETCH_TIMEOUT_MS);let current=initialUrl;
 try{for(let redirects=0;redirects<=3;redirects+=1){const safety=websiteHostSafety(current);if(!safety.safe)throw new ResearchFetchError(safety.reason||"Unsichere Website-Adresse");
  if(expectedHost&&current.hostname.replace(/^www\./,"")!==expectedHost.replace(/^www\./,""))throw new ResearchFetchError("Unterseite verlässt die bestätigte Website-Domain");
  const response=await fetch(current,{redirect:"manual",signal:controller.signal,headers:{Accept:"text/html,application/xhtml+xml","User-Agent":"WebWorkBalance-ExpressResearch/1.0"}});
  if(response.status>=300&&response.status<400){const location=response.headers.get("location");if(!location)throw new ResearchFetchError("Weiterleitung ohne Ziel");current=new URL(location,current);continue;}
  if(!response.ok)throw new ResearchFetchError(`HTTP ${response.status}`);const contentType=response.headers.get("content-type")??"",html=await readHtml(response);
  if(!/html|xhtml/i.test(contentType)&&!/^\s*<!doctype html|^\s*<html/i.test(html))throw new ResearchFetchError("Keine HTML-Seite");return {html,url:current.toString()};}
  throw new ResearchFetchError("Zu viele Weiterleitungen");}finally{clearTimeout(timer);}
}
async function commonsSearch(query:string){
 const params=new URLSearchParams({action:"query",generator:"search",gsrsearch:query,gsrnamespace:"6",gsrlimit:"8",prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"720",format:"json",origin:"*"});
 const response=await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`,{headers:{Accept:"application/json","User-Agent":"WebWorkBalance-ExpressResearch/1.0"}});if(!response.ok)return [];
 const payload=await response.json() as {query?:{pages?:Record<string,Parameters<typeof commonsImageCandidate>[0]>}};
 return Object.values(payload.query?.pages??{}).map(commonsImageCandidate).filter((item):item is NonNullable<typeof item>=>Boolean(item));
}
export async function POST(request:Request){
 try{const payload=await request.json() as {business?:unknown;depth?:unknown},business=sanitizeBusiness(payload.business);if(!business)return Response.json({error:"Die Firmendaten sind unvollständig."},{status:400});
  const depth:ResearchDepth=["quick","standard","deep","maximum"].includes(String(payload.depth))?payload.depth as ResearchDepth:"standard";
  const warnings:string[]=[],pages:ExpressResearchPage[]=[];let officialUrl:string|null=null;const normalized=business.website?normalizeOfficialWebsiteUrl(business.website):null;
  if(normalized&&websiteHostSafety(normalized).safe){try{const homepage=await fetchHtml(normalized);officialUrl=homepage.url;const home=extractWebsiteResearchDossier(homepage.html,homepage.url);pages.push({url:homepage.url,title:home.pageTitle,description:home.description,dossier:home});
   const host=new URL(homepage.url).hostname,candidates=home.importantPages.filter(page=>new URL(page.url).hostname.replace(/^www\./,"")===host.replace(/^www\./,"")).slice(0,Math.max(0,DEPTH_PAGES[depth]-1));
   const fetched=await Promise.allSettled(candidates.map(async page=>{const result=await fetchHtml(new URL(page.url),host),dossier=extractWebsiteResearchDossier(result.html,result.url);return {url:result.url,title:dossier.pageTitle,description:dossier.description,dossier} satisfies ExpressResearchPage;}));
   for(const result of fetched)if(result.status==="fulfilled")pages.push(result.value);}catch(error){warnings.push(`Offizielle Website konnte nicht vollständig gelesen werden: ${error instanceof Error?error.message:"unbekannter Fehler"}.`);}}
  else if(business.website)warnings.push("Die hinterlegte Website ist keine sichere, eigenständige offizielle Domain.");else warnings.push("Keine offizielle Website hinterlegt; der Lauf arbeitet mit öffentlichen Suchpfaden und freien Bildquellen.");
  let commonsImages:ExpressResearchImage[]=[];try{const groups=await Promise.all([`${business.name} ${business.address}`,`${business.category} ${business.address||"Deutschland"}`].map(commonsSearch));commonsImages=[...new Map(groups.flat().map(image=>[image.id,image])).values()].slice(0,depth==="quick"?6:12);}catch{warnings.push("Wikimedia Commons hat für diesen Lauf nicht geantwortet.");}
  return Response.json(createExpressResearchResult({business,depth,officialUrl,pages,commonsImages,warnings}),{headers:{"Cache-Control":"private, no-store"}});
 }catch{return Response.json({error:"Der Express-Recherchelauf konnte nicht abgeschlossen werden."},{status:500});}
}
