import { renderDashboardLayout } from "./dashboard/app.js";
import { loadCSSAndWait } from "./dashboard/utils/loadcss.js";
import { apiFetch } from "./services/api.js";
import { showToast } from "./services/toast.js";

let cleanupCallbacks: (() => void)[] = [];
type AuthResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    household?: string | null;
    mobileNo?: string | null;
    createdAt: string;

  };
}

async function renderLanding(): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;
  document.body.className = "landing";

  await loadCSSAndWait(['./css/landing.css', './css/toast.css'])
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
    const handler = () => renderAuth();
    getStartedBtn.addEventListener('click', handler);
    cleanupCallbacks.push(() => getStartedBtn.removeEventListener("click", handler));
  }
}

export async function renderAuth(runInitAuth = true): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;
  // document.body.className = "auth";
  await loadCSSAndWait("./css/auth.css");
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
          <form id="login-form" class="form active" method="POST" action="javascript:void(0)" >
            <h2>Welcome back again!</h2>
            <input type="email" name="loginemail" id="loginemail" required placeholder="Email">
            <input type="password" name="loginpassword" id="loginpassword" required placeholder="Password">
            <div class="link-button">
              <a href="#">Forgot Password?</a>
              <button type="submit">LOGIN</button>
            </div>
          </form>
          <form id="signup-form" class="form" method="POST" action="javascript:void(0)">
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

  if (runInitAuth) {
    initAuth(() => {
    
      setTimeout(() => {
        const interval = setInterval(async () => {
          const app = document.getElementById("app");
          if (app) {
            clearInterval(interval);
            if (!window.location.hash) {
              window.location.hash = "#groceries";
            } else {
              const { handleRouting } = await import("./dashboard/router.js");
              handleRouting();
            }
            renderDashboardLayout();
          }
        }, 50);
      }, 0);
    });
  }
}

export async function init() {
  try {
    const data = await apiFetch<AuthResponse>("/users/getuser");
    localStorage.setItem("user", JSON.stringify(data.user));
    
  } catch (error) {
    renderLanding();
  }
}
export function dispose() {
  const app = document.getElementById("app");
  if (app) app.innerHTML = "";
  cleanupCallbacks.forEach(fn => fn());
  cleanupCallbacks = [];
  document.querySelectorAll("link[data-dynamic]").forEach(el => el.remove());
}

export function initAuth(onAuthSuccess: () => void): void {
  const loginform = document.getElementById("login-form") as HTMLFormElement | null;
  const signupform = document.getElementById("signup-form") as HTMLFormElement | null;
  if (loginform) {
    loginform.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = (document.getElementById("loginemail") as HTMLInputElement).value;
      const password = (document.getElementById("loginpassword") as HTMLInputElement).value;
      try {
        const data = await apiFetch<AuthResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        document.body.className = "";
        onAuthSuccess();
        showToast('Login successfull', 'success');
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error: any) {
        showToast('Something went wrong', 'error')
        console.error(error);
      }
    });
  }

  if (signupform) {
    signupform.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = (document.getElementById("username") as HTMLInputElement).value;
      const email = (document.getElementById("signupemail") as HTMLInputElement).value;
      const mobileNo = (document.getElementById("mobileno") as HTMLInputElement).value;
      const password = (document.getElementById("signuppassword") as HTMLInputElement).value;
      try {
        const data = await apiFetch<AuthResponse>("/auth/register", {
          method: "POST",
          body: { name, email, mobileNo, password },
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        document.body.className = "";
        onAuthSuccess();
        showToast('Account created successfully', 'success');
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error: any) {
        showToast('Something went wrong', 'error')
        console.error("Error:", error);

      }
    });

  }
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
  const signupBtn = document.getElementById("signupBtn") as HTMLButtonElement;
  if (loginBtn && signupBtn) {
    loginBtn.addEventListener("click", () => {
      loginform?.classList.add("active");
      signupform?.classList.remove("active");
      loginBtn.classList.add("active");
      signupBtn.classList.remove("active");

    });

  }

  signupBtn.addEventListener("click", () => {
    signupform?.classList.add("active");
    loginform?.classList.remove("active");
    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");

  });

  // Mobile drawer toggle
  const drawer = document.querySelector(".mobile-drawer");
  const icon = document.querySelector(".mobile-menu-icon span");
  icon?.addEventListener("click", () => {
    drawer?.classList.toggle("show");
  });

  document.querySelector(".drawer-login")?.addEventListener("click", () => {
    loginBtn?.click();
    drawer?.classList.remove("show");
  });
  document.querySelector(".drawer-signup")?.addEventListener("click", () => {
    signupBtn?.click();
    drawer?.classList.remove("show");
  });



}