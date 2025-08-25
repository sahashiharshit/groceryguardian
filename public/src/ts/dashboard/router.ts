
import { loadCSSAndWait } from "./utils/loadcss.js";
import { hideLoader, showLoader } from "./utils/loader.js";

type RouteHandler = () => void | Promise<void>;


const routes: Record<string, RouteHandler> = {

    groceries: () => importView('groceries', ['../css/grocerypage.css', '../css/modal.css', '../css/form.css']),
    inventory: () => importView('inventory', ['../css/inventory.css']),
    settings: () => importView('settings', ['../css/account.css', '../css/modal.css', '../css/form.css']),
    group: () => importView('group', ["../css/group.css", "../css/modal.css"]),

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
    view.innerHTML = "";
    try {

        const files = Array.isArray(cssFiles) ? cssFiles : [cssFiles];
        // Load CSS + module in parallel
        const [module] = await Promise.all([
            import(`./views/${viewName}.ts`),
            loadCSSAndWait(files),
        ]);

        if (typeof module.render === 'function') {
            await module.render();

        } else {
            view.innerHTML = `<h2>Error: ${viewName} has no render() method</h2>`;
        }
    } catch (error) {

        view.innerHTML = `
      <div class="error">
        <p>Error loading ${viewName}. Please try again.</p>
        <button id="retry-${viewName}">Retry</button>
      </div>`;
        document.getElementById(`retry-${viewName}`)?.addEventListener("click", () => {
            routes[viewName]?.();
        });
    } finally {
        hideLoader();
    }

}

let lastHash = "";
export function handleRouting(): void {


    const hash = window.location.hash.replace('#', '') || 'groceries';
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

