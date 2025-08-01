import { loadCSSAndWait } from "./utils/loadcss";
import { hideLoader, showLoader } from "./utils/loader.js";

type RouteHandler = () => void | Promise<void>;


const routes: Record<string, RouteHandler> = {

    groceries: () => importView('groceries', ['../css/grocerypage.css','../css/modal.css','../css/form.css']),
    inventory: () => importView('inventory', ['../css/inventory.css']),
    settings: () => importView('settings', ['../css/account.css','../css/modal.css','../css/form.css']),
    group: () => importView('group', ["../css/group.css","../css/modal.css"]),

};

/**
 * Dynamically imports and renders a view.
 * @param viewName - Name of the view to load
 */

export async function importView(viewName: string, cssFiles: string | string[]): Promise<void> {
    const view = document.getElementById("view");
    if (!view) {
        console.warn("Dashboard layout not initialized yet.");
        return;
    }
    showLoader();
    //await new Promise((res) => setTimeout(res, 50));
    try {


        const [module] = await Promise.all([import(`./views/${viewName}.ts`), loadCSSAndWait(cssFiles)]);

        if (typeof module.render === 'function') {
            await module.render();

        } else {
            view.innerHTML = `<h2>Error loading view ${viewName}</h2>`;
        }
    } catch (error) {
        console.error(`Error loading view ${viewName}:`, error);
        view.innerHTML = `<h2>Error loading view ${viewName}</h2>`;
    } finally {
        hideLoader();
    }

}

let lastHash = "";
export function handleRouting(): void {
   
    const hash = window.location.hash.replace('#', '') || 'groceries';
    console.log("Routing to:", hash);
    if (hash === lastHash) return;
    lastHash = hash;

    const route = routes[hash];
    if (route) {
        route();
    } else {
        const view = document.getElementById("view");
        if (view) {
            view.innerHTML = `<h2>Page not found</h2>`;
        }
    }
}
