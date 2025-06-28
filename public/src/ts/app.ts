import { initAuth } from "./authHandler";
import { renderDashboardLayout } from "./dashboard/app";


let cleanupCallbacks: (() => void)[] = [];



function loadCSS(href: string) {
  document.querySelectorAll("link[data-dynamic]").forEach(el => el.remove());

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.dynamic = "true";
  document.head.appendChild(link);

}


function renderLanding(): void {
  const app = document.getElementById("app");
  if (!app) return;
  document.body.className = "landing";
  loadCSS("./css/landing.css");
  app.innerHTML = `
    <div class="start-page">
      <div class="overlay">
        <div class="content-wrapper">
          <div class="content">
            <h1>Welcome to Grocery Guardian</h1>
            <p>
              Keep your household and roommates in sync—track groceries, manage
              inventory, and never run out of essentials.
            </p>
            <div class="buttons">
              <button id="getStartedBtn" class="btn">Get Started</button>
            </div>
            <div class="features">
              <ul>
                <li><i class="fas fa-check"></i> Track groceries and inventory</li>
                <li><i class="fas fa-sync-alt"></i> Sync with household members</li>
                <li><i class="fas fa-bell"></i> Get notified for low stock and expiry</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const getStartedBtn = document.getElementById('getStartedBtn') as HTMLElement;
  if (getStartedBtn) {
    const handler = ()=>renderAuth();
    
    getStartedBtn.addEventListener('click',handler ); 
    cleanupCallbacks.push(()=>getStartedBtn.removeEventListener("click",handler));
  }


}

export function renderAuth(): void {
  const app = document.getElementById("app");
  if (!app) return;
  document.body.className = "auth";
  loadCSS("./css/auth.css");
  app.innerHTML = `<div class="container">
      <div class="left">
        <div class="mobile-menu-icon">
          <span>&#9776</span>
        </div>
        <div class="mobile-drawer">
          <button class="auth-btn drawer-login active">Login</button>
          <button class="auth-btn drawer-signup">Signup</button>
        </div>
        <div class="toggle-buttons">
          <button id="loginBtn" class="auth-btn active">Login</button>
          <button id="signupBtn" class="auth-btn">Signup</button>
        </div>
      </div>

      <div class="right">
        <img src="./assets/logo.png" alt="Logo" class="logo">
        <div class="forms-wrapper">
          <form id="login-form" class="form active">
            <h2>Welcome back again!</h2>
            <input type="email" name="loginemail" id="loginemail" required placeholder="Email">
            <input type="password" name="loginpassword" id="loginpassword" required placeholder="Password">
            <div class="link-button">
              <a href="#">Forgot Password?</a>
              <button type="submit">LOGIN</button>
            </div>
          </form>

          <form id="signup-form" class="form">
            <h2>Start managing your grocery!...</h2>
            <input type="text" placeholder="Full Name" id="username" name="username" required>
            <input type="email" placeholder="Email" id="signupemail" name="signupemail" required>
            <input type="string" placeholder="Your Phone No" id="mobileno" name="mobileno" required>
            <input type="password" placeholder="Password" id="signuppassword" name="signuppassword" required>
            <button type="submit">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>`;

  initAuth(() => {
    (window as any).hmrLoad?.("./dashboard/app.ts");
    renderDashboardLayout();
  });
}

export function init(){
  const token = localStorage.getItem("accesstoken");
 token ? (window as any).hmrLoad?.("./dashboard/app.js") : renderLanding();
}
export function dispose(){
 console.log("♻️ Disposing app before hot reload");
 
 const app = document.getElementById("app");
 if(app) app.innerHTML ="";

  cleanupCallbacks.forEach(fn=>fn());
  cleanupCallbacks=[];
  
  document.querySelectorAll("link[data-dynamic]").forEach(el=>el.remove());
}

