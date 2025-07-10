
import { renderAuth } from '../app.js';
import { handleRouting } from './router.js';
import { loadCSS } from './utils/loadcss.js';


declare global {
  interface Window {
    _routingSetupDone?: boolean;
  }
}


let hasRenderedDashboard = false;
let cleanupFns: (() => void)[] = [];
let pageTitle ="Dashboard";
export function setPageTitle(title:string):void {
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
  const handler = () => {
  console.log("👉 Logging out");
    history.pushState("", document.title, window.location.pathname + window.location.search);
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('user')
    
    window._routingSetupDone = false;
    hasRenderedDashboard = false;
     console.log("✅ Cleared hash, calling renderAuth");
    renderAuth(false);
  }
  logoutBtn?.addEventListener('click', handler);
  cleanupFns.push(() => logoutBtn?.removeEventListener("click", handler));
}


export function renderDashboardLayout(): void {
const token = localStorage.getItem("accesstoken");
  if (!token) {
    console.warn("⛔ No token, skipping dashboard render");
    return;
  }
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
  loadCSS("../css/dashboard.css");
  
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

export function init() {
  const token = localStorage.getItem("accesstoken");
  token ? renderDashboardLayout() : renderAuth();
}

export function dispose() {
  const app = document.getElementById("app");
  if (app) app.innerHTML = "";
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  hasRenderedDashboard = false;
  window._routingSetupDone = false;
}