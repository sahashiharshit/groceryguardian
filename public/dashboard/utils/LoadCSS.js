const loadedCSS= new Set();

export function loadCSS(href){

if(loadedCSS.has(href)) return;

const link = document.createElement("link");
link.rel="stylesheet";
link.href=href;
document.head.appendChild(link);

loadedCSS.add(href);


}