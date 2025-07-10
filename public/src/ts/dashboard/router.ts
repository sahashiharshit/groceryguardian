type RouteHandler = () => void;


const routes: Record<string, RouteHandler> = {

    groceries: () => importView('groceries'),
    inventory: () => importView('inventory'),
    settings: () => importView('settings'),
    group: () => importView('group'),
  
};

/**
 * Dynamically imports and renders a view.
 * @param viewName - Name of the view to load
 */

export function importView(viewName: string): void {
    const view = document.getElementById("view");
    if (!view) {
        console.warn("Dashboard layout not initialized yet.");
        return;
    }
    view.innerHTML = `<h2>Loading ${viewName}...</h2>`;

    import(`./views/${viewName}.ts`)
        .then(module => {
            if (typeof module.render === 'function') {
                module.render();

            } else {
                view.innerHTML = `<h2>Error loading view ${viewName}</h2>`;
            }
        }).catch(error => {
            console.error(`Error loading view ${viewName}:`, error);
            view.innerHTML = `<h2>Error loading view ${viewName}</h2>`;
        })

}

let lastHash = "";
export function handleRouting(): void {
    const token = localStorage.getItem("accesstoken");
  if (!token) {
    console.warn("🔐 No token, aborting route");
    return;
  }
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
