
import { renderAuth } from '../app.js';
import { apiFetch } from '../services/api.js';
import { handleRouting } from './router.js';
import { loadCSSAndWait } from './utils/loadcss.js';
import { hideLoader, showLoader } from './utils/loader.js';

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
  document.title = `${title} | Grocery Guardian`;
}

const sidebarHTML = `
<aside class="sidebar">
  <div>    
<h2>Grocery Guardian</h2>
    <nav>
      <a href="#groceries"><i class="fas fa-shopping-basket"></i> Groceries</a>
      <a href="#inventory"><i class="fas fa-boxes-stacked"></i> Inventory</a>
      <a href="#settings"><i class="fas fa-user"></i> Account</a>
      <a href="#group"><i class="fas fa-people-roof"></i> Group</a>
    </nav>
  </div>
    <button id="logoutBtn" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  
    </aside>`;

function setupLogoutButton(): void {
  const logoutBtn = document.getElementById('logoutBtn');
  const handler = async () => {
    await apiFetch('/auth/logout', { method: "POST" }).catch(() => { });
    localStorage.removeItem('user')
    window._routingSetupDone = false;
    hasRenderedDashboard = false;
    window.location.hash = "";
    await renderAuth();
  }
  logoutBtn?.addEventListener('click', handler);
  cleanupFns.push(() => logoutBtn?.removeEventListener("click", handler));
}


export async function renderDashboardLayout(): Promise<void> {

  if (hasRenderedDashboard) return;

  const app = document.getElementById("app");
  if (!app) return;
  showLoader();
  try {
    await loadCSSAndWait(["../css/dashboard.css","../css/toast.css"]);
    app.innerHTML = `<div class="dashboard">
     ${sidebarHTML}
      <main class="main-content">
        <header class="topbar">
        <button class="menu-toggle" id="sidebarToggle" aria-label="Toggle Sidebar">&#9776;</button>
          <h1 id="pageTitle">${pageTitle}</h1>
        </header>

        <section id="view" class="view-container">
          <!-- Views will be dynamically injected here -->
        </section>
      </main>
    </div>`;
    // Sidebar toggle behavior
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");

    const onToggle = () => {
      sidebar?.classList.toggle("open");
      const closeOutside = (e: MouseEvent) => {
        if (!sidebar?.contains(e.target as Node) && e.target !== toggleBtn) {
          sidebar?.classList.remove("open");
          document.removeEventListener("click", closeOutside);
        }
      };
      document.addEventListener("click", closeOutside);
      cleanupFns.push(() => document.removeEventListener("click", closeOutside));
    };
    toggleBtn?.addEventListener("click", onToggle);
    cleanupFns.push(() => toggleBtn?.removeEventListener("click", onToggle));

    //Close sidebar when clicking nav links
    const navLinks = sidebar?.querySelectorAll("nav a") || [];
    navLinks.forEach((link) => {
      const handler = () => sidebar?.classList.remove("open");
      link.addEventListener("click", handler);
      cleanupFns.push(() => link.removeEventListener("click", handler));
    });
    setupLogoutButton();
    //One-time Routing setup
    if (!window._routingSetupDone) {
      window.addEventListener("hashchange", handleRouting);

      cleanupFns.push(() => {
        window.removeEventListener("hashchange", handleRouting);

      });
      window._routingSetupDone = true;
    }
    handleRouting();
    hasRenderedDashboard = true;
  } finally {
    hideLoader();
  }

}

export function dispose(): void {
  const app = document.getElementById("app");
  if (app) app.innerHTML = "";
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  hasRenderedDashboard = false;
  window._routingSetupDone = false;
}

