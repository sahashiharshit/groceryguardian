const loadedCSS= new Set<string>();

export function loadCSS(href:string):void{

if(loadedCSS.has(href)) return;

const link = document.createElement("link");
link.rel="stylesheet";
link.href=href;
document.head.appendChild(link);

loadedCSS.add(href);


}