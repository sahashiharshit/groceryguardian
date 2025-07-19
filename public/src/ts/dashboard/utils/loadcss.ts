const loadedCSS = new Set<string>();
/**
 * Loads CSS dynamically and waits for it to be applied.
 * Will not re-load if already loaded.
 */
export async function loadCSSAndWait(hrefs: string |string[]): Promise<void> {
 const cssArray = Array.isArray(hrefs) ? hrefs : [hrefs];
 const promises = cssArray.map(href => {
    if (loadedCSS.has(href)) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
       
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => {
            loadedCSS.add(href);
            resolve();
        };
        link.onerror = () => {
            console.error(`❌ Failed to load CSS: ${href}`);
            reject(new Error(`Failed to load CSS: ${href}`));

        }

        document.head.appendChild(link);
    });

 });
    return Promise.all(promises).then(()=>{});

}