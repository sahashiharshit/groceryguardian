

import { renderAuth } from '../app.js';
import { handleRouting } from './router.js';
import { loadCSS } from './utils/LoadCSS.js';


declare global {
  interface Window {
    _routingSetupDone?: boolean;
  }
}


let hasRenderedDashboard = false;
let cleanupFns:(()=>void)[]=[];


const sidebarHTML = `
<aside class="sidebar">
    <h2>Grocery Guardian</h2>
    <nav>
      <a href="#groceries"><i class="fas fa-shopping-basket"></i> Groceries</a>
      <a href="#inventory"><i class="fas fa-boxes-stacked"></i> Inventory</a>
      <a href="#settings"><i class="fas fa-user"></i> Account</a>
      <a href="#group"><i class="fas fa-people-roof"></i> Group</a>
      <a href="#invite"><i class="fas fa-people-roof"></i> Invite</a>
      <a href="#addGrocery"><i class="fas fa-people-roof"></i> Add Grocery</a>
      <a href="#scanView"><i class="fas fa-people-roof"></i> Add to database</a>
      
    </nav>
    <button id="logoutBtn" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </aside>`;

function setupLogoutButton(): void {
  const logoutBtn = document.getElementById('logoutBtn');
  const handler = ()=>{
   localStorage.removeItem('accesstoken');
    localStorage.removeItem('username');
    window._routingSetupDone = false;
    hasRenderedDashboard = false;
    renderAuth();
  
  }
  logoutBtn?.addEventListener('click',handler);
  cleanupFns.push(()=>logoutBtn?.removeEventListener("click",handler));
}


export function renderDashboardLayout(): void {

  if (hasRenderedDashboard) return;
  hasRenderedDashboard = true;
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `<div class="dashboard">
     ${sidebarHTML}
      <main class="main-content">
        <header class="topbar">
          <h1 id="pageTitle">Dashboard</h1>
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
    cleanupFns.push(()=>{
      window.removeEventListener("hashchange",handleRouting);
      window.removeEventListener("DOMContentLoaded",handleRouting);
    });
    window._routingSetupDone = true;
  }

  handleRouting();


}

export function init(){
const token = localStorage.getItem("accesstoken");
token?renderDashboardLayout():renderAuth();
}

export function dispose(){
  const app = document.getElementById("app");
  if(app) app.innerHTML="";
  cleanupFns.forEach((fn)=>fn());
  cleanupFns=[];
  hasRenderedDashboard=false;
  window._routingSetupDone=false;
}