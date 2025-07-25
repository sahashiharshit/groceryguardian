
import { initAuth, renderAuth } from '../app.js';
import { apiFetch } from '../services/api.js';
import { handleRouting } from './router.js';
import { loadCSSAndWait } from './utils/loadcss.js';



declare global {
  interface Window {
    _routingSetupDone?: boolean;
  }
}


let hasRenderedDashboard = false;
let cleanupFns: (() => void)[] = [];
let pageTitle = "Dashboard";
export function setPageTitle(title: string): void {
  pageTitle = title;
  const pageTitleElement = document.getElementById("pageTitle");
  if (pageTitleElement) {
    pageTitleElement.textContent = title;
  }
}

const sidebarHTML = `
<aside class="sidebar">
    <h2>Grocery Guardian</h2>
    <nav>
      <a href="#groceries"><i class="fas fa-shopping-basket"></i> Groceries</a>
      <a href="#inventory"><i class="fas fa-boxes-stacked"></i> Inventory</a>
      <a href="#settings"><i class="fas fa-user"></i> Account</a>
      <a href="#group"><i class="fas fa-people-roof"></i> Group</a>
  
      
    </nav>
    <button id="logoutBtn" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </aside>`;

function setupLogoutButton(): void {
  const logoutBtn = document.getElementById('logoutBtn');
  const handler = async () => {
    const res = await apiFetch('/auth/logout',{method:"POST"});
    
    localStorage.removeItem('user')

    window._routingSetupDone = false;
    hasRenderedDashboard = false;
    window.location.hash = "#";

    renderAuth(false);
    setTimeout(() => {
      initAuth(() => {
        console.log("🔥 Auth success after logout");
        (window as any).hmrLoad?.("./dashboard/app.js");
        renderDashboardLayout();
      });
    }, 0);
  }
  logoutBtn?.addEventListener('click', handler);
  cleanupFns.push(() => logoutBtn?.removeEventListener("click", handler));
}


export async function renderDashboardLayout(): Promise<void> {

  if (hasRenderedDashboard) return;
  hasRenderedDashboard = true;
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `<div class="dashboard">
     ${sidebarHTML}
      <main class="main-content">
        <header class="topbar">
          <h1 id="pageTitle">${pageTitle}</h1>
        </header>

        <section id="view" class="view-container">
          <!-- Views will be dynamically injected here -->
        </section>
      </main>
    </div>`;

  setupLogoutButton();
  await loadCSSAndWait("../css/dashboard.css");


  if (!window._routingSetupDone) {
    window.addEventListener("hashchange", handleRouting);
    window.addEventListener("DOMContentLoaded", handleRouting);
    cleanupFns.push(() => {
      window.removeEventListener("hashchange", handleRouting);
      window.removeEventListener("DOMContentLoaded", handleRouting);
    });
    window._routingSetupDone = true;
  }

  setTimeout(() => handleRouting(), 0);
}

export async function init() {
  try {
    const data = await apiFetch("/users/getuser", {
      method: "GET",
    });
    if (!data) throw new Error("Not authenticated");
    renderDashboardLayout();
  } catch (error) {
    console.warn("Not logged in, showing auth screen.");
    renderAuth();
  }
}

export function dispose() {
  const app = document.getElementById("app");
  if (app) app.innerHTML = "";
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  hasRenderedDashboard = false;
  window._routingSetupDone = false;
}