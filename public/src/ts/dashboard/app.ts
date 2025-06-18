

import { renderAuth } from '../app.js';
import {handleRouting} from './router.js';
import { loadCSS } from './utils/LoadCSS.js';

const token = localStorage.getItem("accesstoken");
if(!token){

renderAuth();

}else{
renderDashboardLayout();
}


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
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('username');
    renderAuth();
  });
}

export function renderDashboardLayout():void{
 
  
const app = document.getElementById("app");
if(!app) return;

app.innerHTML =`<div class="dashboard">
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
    window.addEventListener("hashchange",handleRouting);
    window.addEventListener("DOMContentLoaded",handleRouting);
    handleRouting();
    
   
}
