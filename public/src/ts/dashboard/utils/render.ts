export function renderHTML(selector,content){

const element = document.querySelector(selector);
if(!element){
console.warn(`Element not found: ${selector}`);
return;
}

element.innerHTML = typeof content ==='function'?content():content;
}