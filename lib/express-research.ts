import type { MasterPromptEvidence, MasterPromptResearch, ResearchDepth } from "./masterprompt-engine";
import type { Business, WebsiteResearchDossier, WebsiteResearchImage, WebsiteResearchPage } from "./webworkbalance";
export interface ExpressResearchLink { label: string; url: string; purpose: string; }
export interface ExpressResearchImage { id: string; title: string; thumbnailUrl: string; sourceUrl: string; artist: string; license: string; usageStatus: "open-license-candidate" | "official-site-rights-open"; origin: "wikimedia-commons" | "official-website"; alt: string; }
export interface ExpressResearchPage { url: string; title: string | null; description: string | null; dossier: WebsiteResearchDossier; }
export interface ExpressResearchResult { generatedAt: string; depth: ResearchDepth; officialUrl: string | null; mapUrl: string; searchLinks: ExpressResearchLink[]; pages: ExpressResearchPage[]; images: ExpressResearchImage[]; promptResearch: MasterPromptResearch; dossier: string; warnings: string[]; metrics: { officialPages: number; sources: number; imageCandidates: number; }; }
const unique=<T>(items:T[])=>[...new Set(items)];
const clean=(value:unknown,fallback="")=>typeof value==="string"?value.trim():fallback;
const strip=(value:string)=>value.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const google=(query:string)=>`https://www.google.com/search?q=${encodeURIComponent(query)}`;
export function expressResearchLinks(business:Pick<Business,"name"|"category"|"address">){
 const location=clean(business.address,"Deutschland"), identity=[business.name,location].filter(Boolean).join(" "), industry=[business.category,location].filter(Boolean).join(" ");
 return {mapUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(identity)}`,links:[
  {label:"Unternehmen im Web",url:google(identity),purpose:"Identität, Website und öffentliche Firmensignale gegenprüfen"},
  {label:"Leistungen & Erwähnungen",url:google(`"${business.name}" Leistungen Referenzen`),purpose:"Öffentliche Leistungs- und Pressehinweise finden"},
  {label:"Branche & Standort",url:google(`${industry} Anbieter`),purpose:"Lokalen Wettbewerbs- und Erwartungsrahmen verstehen"},
  {label:"Social-Profile",url:google(`"${business.name}" Instagram Facebook LinkedIn`),purpose:"Offizielle Social-Profile als mögliche Primärquellen finden"},
  {label:"Freie Bilder",url:`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(industry)}&title=Special:MediaSearch&type=image`,purpose:"Offen lizenzierte Branchen- und Ortsmotive recherchieren"},
 ]};
}
export function mergeWebsiteResearchDossiers(pages:ExpressResearchPage[]):WebsiteResearchDossier{
 const ds=pages.map(page=>page.dossier),by=<T>(items:T[],key:(item:T)=>string)=>[...new Map(items.map(item=>[key(item),item])).values()];
 return {pageTitle:ds.find(x=>x.pageTitle)?.pageTitle??null,description:ds.find(x=>x.description)?.description??null,
  headings:unique(ds.flatMap(x=>x.headings)).slice(0,36),serviceHints:unique(ds.flatMap(x=>x.serviceHints)).slice(0,24),
  contactHints:unique(ds.flatMap(x=>x.contactHints)).slice(0,20),socialLinks:unique(ds.flatMap(x=>x.socialLinks)).slice(0,12),
  importantPages:by<WebsiteResearchPage>(ds.flatMap(x=>x.importantPages),x=>x.url).slice(0,24),
  images:by<WebsiteResearchImage>(ds.flatMap(x=>x.images),x=>x.url).slice(0,20),
  brandColors:unique(ds.flatMap(x=>x.brandColors)).slice(0,8),technologyHints:unique(ds.flatMap(x=>x.technologyHints)).slice(0,12)};
}
export function commonsImageCandidate(input:{pageid:number;title?:string;imageinfo?:Array<{thumburl?:string;descriptionurl?:string;extmetadata?:Record<string,{value?:string}>}>}):ExpressResearchImage|null{
 const info=input.imageinfo?.[0];if(!info?.thumburl||!info.descriptionurl)return null;const meta=info.extmetadata??{};
 return {id:`commons-${input.pageid}`,title:clean(input.title,"Wikimedia-Bild").replace(/^File:/i,""),thumbnailUrl:info.thumburl,sourceUrl:info.descriptionurl,
  artist:strip(clean(meta.Artist?.value,"Urheber auf Commons prüfen")).slice(0,180),license:strip(clean(meta.LicenseShortName?.value,clean(meta.UsageTerms?.value,"Lizenz auf Commons prüfen"))).slice(0,180),
  usageStatus:"open-license-candidate",origin:"wikimedia-commons",alt:strip(clean(meta.ImageDescription?.value,input.title??"Freies Bild")).slice(0,220)};
}
function officialImage(image:WebsiteResearchImage,index:number):ExpressResearchImage{return {id:`official-${index}-${encodeURIComponent(image.url).slice(-24)}`,title:image.alt||`Bild der offiziellen Website ${index+1}`,thumbnailUrl:image.url,sourceUrl:image.sourceUrl,artist:"Offizielle Unternehmenswebsite",license:image.rightsNote,usageStatus:"official-site-rights-open",origin:"official-website",alt:image.alt};}
export function createExpressResearchResult(input:{business:Pick<Business,"name"|"category"|"address">;depth:ResearchDepth;officialUrl?:string|null;pages?:ExpressResearchPage[];commonsImages?:ExpressResearchImage[];warnings?:string[]}):ExpressResearchResult{
 const pages=input.pages??[],merged=mergeWebsiteResearchDossiers(pages),images=[...merged.images.map(officialImage),...(input.commonsImages??[])].slice(0,24),{mapUrl,links}=expressResearchLinks(input.business);
 const evidence:MasterPromptEvidence[]=[
  ...pages.map(page=>({label:"Offizielle Website-Seite",value:[page.title,page.description].filter(Boolean).join(" — ")||page.url,sourceLabel:new URL(page.url).hostname,sourceUrl:page.url,confidence:"source-reported" as const,usage:"fact" as const})),
  ...images.map(image=>({label:image.origin==="wikimedia-commons"?"Offen lizenzierter Bildkandidat":"Bildkandidat der offiziellen Website",value:image.title,sourceLabel:image.artist,sourceUrl:image.sourceUrl,confidence:image.origin==="wikimedia-commons"?"unverified" as const:"source-reported" as const,usage:"visual-reference" as const,license:image.license}))];
 const promptResearch:MasterPromptResearch={summary:`${pages.length} offizielle Seite(n), ${images.length} Bildkandidat(en) und ${links.length+1} Prüfpfade vorbereitet. Google Maps wird nur verlinkt; Fotos und Bewertungen werden nicht gescrapt.`,services:merged.serviceHints,evidence};
 const nav=merged.importantPages.map(page=>`- ${page.type}: ${page.label} — ${page.url}`).join("\n")||"- Keine Unterseiten sicher erkannt.";
 const imgs=images.map(image=>`- ${image.title} — ${image.sourceUrl} — ${image.artist} — ${image.license} — Status: ${image.usageStatus}`).join("\n")||"- Noch keine Bildkandidaten.";
 const dossier=[`EXPRESS-RECHERCHE-DOSSIER · ${input.business.name}`,`Branche: ${input.business.category}`,`Standort: ${input.business.address||"nicht hinterlegt"}`,`Tiefe: ${input.depth}`,`Offizielle Website: ${input.officialUrl||"nicht bestätigt"}`,`Google Maps: ${mapUrl}`,"",
 "ERKANNTE LEISTUNGS- UND INHALTSHINWEISE",merged.serviceHints.map(x=>`- ${x}`).join("\n")||"- Manuell prüfen.","","MARKEN- UND TECHNIKHINWEISE",`- Farben: ${merged.brandColors.join(", ")||"nicht eindeutig"}`,`- Technik: ${merged.technologyHints.join(", ")||"nicht eindeutig"}`,"",
 "WICHTIGE UNTERSEITEN",nav,"","BILDKANDIDATEN UND RECHTE",imgs,"","MANUELLE WEB-PRÜFPFADE",links.map(link=>`- ${link.label}: ${link.url} — ${link.purpose}`).join("\n"),"","RECHTE- UND FAKTENREGEL","Google-Maps-Fotos, Bewertungen, fremde Logos und Texte nicht automatisiert herunterladen oder übernehmen. Identität, Aktualität, Urheber und konkrete Lizenz vor Veröffentlichung bestätigen."].join("\n");
 return {generatedAt:new Date().toISOString(),depth:input.depth,officialUrl:input.officialUrl??null,mapUrl,searchLinks:links,pages,images,promptResearch,dossier,warnings:input.warnings??[],metrics:{officialPages:pages.length,sources:pages.length+links.length+1,imageCandidates:images.length}};
}
