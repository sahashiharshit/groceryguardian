import { renderDashboardLayout } from "./dashboard/app.js";
import { handleRouting } from "./dashboard/router.js";
import { loadCSSAndWait } from "./dashboard/utils/loadcss.js";
import { hideLoader, showLoader } from "./dashboard/utils/loader.js";
import { apiFetch } from "./services/api.js";
import { showToast } from "./services/toast.js";

type AuthResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    household?: string | null;
    mobileNo?: string | null;
    createdAt: string;

  }
}

let cleanupCallbacks: (() => void)[] = [];

async function renderLanding(): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;
  document.body.className = "landing";

  await loadCSSAndWait(['./css/landing.css', './css/toast.css']);
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
};

export async function renderAuth(): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;
  // clean previous listeners (if any)
  dispose();

  document.body.className = "auth";
  await loadCSSAndWait(["./css/auth.css", "./css/toast.css"]);

  app.innerHTML = `
  <div class="container">
      <div class="left">
        <div class="mobile-menu-icon">
          <span>&#9776;</span>
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
            <div class="password-wrapper">
              <input type="password" name="loginpassword" id="loginpassword" required placeholder="Password">
              <button type="button" class="toggle-password" data-target="loginpassword">👁</button>
            </div>
            <div class="link-button">
              <button type="button" id="forgot-password-link" class="link-like">Forgot Password?</button>
              <button type="submit" class="login-btn">LOGIN</button>
            </div>
          </form>
          <form id="signup-form" class="form" method="POST" action="javascript:void(0)">
            <h2>Start managing your grocery!...</h2>
            <input type="text" placeholder="Full Name" id="username" name="username" required>
            <input type="email" placeholder="Email" id="signupemail" name="signupemail" required>
            <div class="password-wrapper">
              <input type="password" placeholder="Password" id="signuppassword" name="signuppassword" required>
              <button type="button" class="toggle-password" data-target="signuppassword">👁</button>
            </div>
            <div class="password-wrapper">
              <input type="password" placeholder="Retype Password" id="signupretype" name="signupretype" required>
              <button type="button" class="toggle-password" data-target="signupretype">👁</button>
            </div>
            <button type="submit" class="signup-btn">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>`;
  initAuth();

};

function initAuth(): void {
  //Forms
  const loginForm = document.getElementById("login-form") as HTMLFormElement | null;
  const signupForm = document.getElementById("signup-form") as HTMLFormElement | null;
  //Tab Buttons 
  const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  const signupBtn = document.getElementById("signupBtn") as HTMLButtonElement | null;
  // Drawer
  const drawer = document.querySelector(".mobile-drawer") as HTMLElement | null;
  const drawerIcon = document.querySelector(".mobile-menu-icon span") as HTMLElement | null;
  const drawerLogin = document.querySelector(".drawer-login") as HTMLElement | null;
  const drawerSignup = document.querySelector(".drawer-signup") as HTMLElement | null;

  // Password toggles
  const toggleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".toggle-password"));

  if (!loginForm || !signupForm) {
    console.warn("Auth forms not found, aborting initAuth.");
    return;
  }

  const switchToLogin = () => {

    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    loginBtn?.classList.add("active");
    signupBtn?.classList.remove("active");

  };
  const switchToSignup = () => {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    signupBtn?.classList.add("active");
    loginBtn?.classList.remove("active");
  };
  if (loginBtn && signupBtn) {
    loginBtn.addEventListener("click", switchToLogin);
    signupBtn.addEventListener("click", switchToSignup);

    cleanupCallbacks.push(() => {
      loginBtn.removeEventListener("click", switchToLogin);
      signupBtn.removeEventListener("click", switchToSignup);
    });
  }

  // Drawer listeners
  if (drawerIcon && drawer) {
    const toggleDrawer = () => drawer.classList.toggle("show");
    drawerIcon.addEventListener("click", toggleDrawer);
    cleanupCallbacks.push(() => drawerIcon.removeEventListener("click", toggleDrawer));
  }

  if (drawerLogin) {
    const onDrawerLogin = () => {
      switchToLogin();
      drawer?.classList.remove("show");
    };
    drawerLogin.addEventListener("click", onDrawerLogin);
    cleanupCallbacks.push(() => drawerLogin.removeEventListener("click", onDrawerLogin));
  }
  if (drawerSignup) {
    const onDrawerSignup = () => {
      switchToSignup();
      drawer?.classList.remove("show");
    };
    drawerSignup.addEventListener("click", onDrawerSignup);
    cleanupCallbacks.push(() => drawerSignup.removeEventListener("click", onDrawerSignup));
  }

  // Toggle password visibility
  toggleButtons.forEach((btn) => {
    const handler = () => {
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;
      const input = document.getElementById(targetId) as HTMLInputElement | null;
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁" : "🙈";
    };
    btn.addEventListener("click", handler);
    cleanupCallbacks.push(() => btn.removeEventListener("click", handler));
  });

  // Login submit
  const onLoginSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const email = (document.getElementById("loginemail") as HTMLInputElement).value;
    const password = (document.getElementById("loginpassword") as HTMLInputElement).value;

    showLoader();
    try {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      await goToApp();
      showToast("Welcome Back!", "success");
    } catch (error: any) {
      if (error?.status === 403 && error?.code === "EMAIL_NOT_VERIFIED" && error?.userId) {
        showToast("Please verify your email to login.", "info");
        renderVerifyEmailPage(email);
        return;
      }
      showToast(error?.message || "Login failed", "error");
    } finally {
      hideLoader();
    }
  };

  // Signup submit
  const onSignupSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const name = (document.getElementById("username") as HTMLInputElement).value;
    const email = (document.getElementById("signupemail") as HTMLInputElement).value;
    const password = (document.getElementById("signuppassword") as HTMLInputElement).value;
    const passwordRetype = (document.getElementById("signupretype") as HTMLInputElement).value;

    if (password !== passwordRetype) {
      showToast("Passwords do not match", "error");
      return;
    }

    showLoader();
    try {
      const data = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      renderVerifyEmailPage(email); 
      showToast("We sent an OTP to your email. Please verify.", "success");
    } catch (error: any) {
      showToast(error?.message || "Signup failed", "error");
    } finally {
      hideLoader();
    }
  };
 

  loginForm.addEventListener("submit", onLoginSubmit);
  signupForm.addEventListener("submit", onSignupSubmit);
  cleanupCallbacks.push(() => {
    loginForm.removeEventListener("submit", onLoginSubmit);
    signupForm.removeEventListener("submit", onSignupSubmit);
  });

  const forgotLink = loginForm.querySelector("button#forgot-password-link") as HTMLElement | null;
  if(forgotLink){

    const onForgotPassword = (e:Event) => {
      e.preventDefault();
      renderForgotPasswordPage();
    };
    forgotLink.addEventListener("click", onForgotPassword);
    cleanupCallbacks.push(() => forgotLink.removeEventListener("click", onForgotPassword));
  }
}
/**
* Shared helper: enter the app (dashboard) and route.
*/
async function goToApp(): Promise<void> {
  document.body.className = "dashboard";
  if (!window.location.hash) {
    window.location.hash = "#groceries";
  }
  await renderDashboardLayout();
  handleRouting();
}
/* --------------------------
   App bootstrap
--------------------------- */

export async function init() {
  showLoader();
  try {
    const data = await apiFetch<AuthResponse>("/users/getuser");
    localStorage.setItem("user", JSON.stringify(data.user));
    document.body.className = "dashboard";
    await goToApp();
  } catch (error) {
    localStorage.removeItem("user");
    await renderAuth();

  } finally {
    hideLoader();
  }
}
/* --------------------------
   Cleanup
--------------------------- */
export function dispose() {
  const app = document.getElementById("app");
  if (app) app.innerHTML = "";
  cleanupCallbacks.forEach(fn => fn());
  cleanupCallbacks = [];
  document.querySelectorAll('link[data-dynamic="true"]').forEach(el => el.remove());
}

function renderVerifyEmailPage(email: string): void {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML=`
  <div class="otp-verification">
      <h2>Email Verification</h2>
      <p>We’ve sent an OTP to <b>${email}</b>. Please enter it below.</p>
      <form id="otpForm">
        <input type="text" id="otpInput" placeholder="Enter OTP" required />
        <button type="submit">Verify</button>npm 
      </form>
    </div>
  `;
  const otpForm = document.getElementById("otpForm") as HTMLFormElement;
  otpForm.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const otp = (document.getElementById("otpInput") as HTMLInputElement).value;

    showLoader();
    try {
      const data = await apiFetch<AuthResponse>("/auth/verify-otp", {
        method: "POST",
        body: { email, otp },
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      await goToApp();
      showToast("Email verified successfully!", "success");
    } catch (error: any) {
      showToast(error?.message || "OTP verification failed", "error");
    } finally {
      hideLoader();
    }
  });

}
function renderForgotPasswordPage():void{

  const app= document.getElementById('app');
  if(!app) return;

  app.innerHTML=`
    <div class="forgot-password">
      <h2>Forgot Password?</h2>
      <p>Enter your email and we’ll send you a reset OTP.</p>
      <form id="forgotForm">
        <input type="email" id="forgotEmail" placeholder="Enter your email" required />
        <button type="submit">Send OTP</button>
      </form>
      <button id="backToLogin">Back to Login</button>
    </div>
  `;
const forgotForm = document.getElementById("forgotForm") as HTMLFormElement;
const backToLogin = document.getElementById("backToLogin") as HTMLButtonElement;

backToLogin.addEventListener("click", () => renderAuth());
  forgotForm.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const email = (document.getElementById("forgotEmail") as HTMLInputElement).value;

    showLoader();
    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });

      showToast("Reset OTP sent successfully!", "success");
      renderResetPasswordPage(email);
    } catch (error: any) {
      showToast(error?.message || "Failed to send reset OTP", "error");
    } finally {
      hideLoader();
    }
  });
}

function renderResetPasswordPage(email:string):void{
const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="reset-password">
      <h2>Reset Password</h2>
      <p>Enter the OTP sent to <b>${email}</b> and your new password.</p>
      <form id="resetForm">
        <input type="text" id="resetOtp" placeholder="Enter OTP" required />
        <input type="password" id="newPassword" placeholder="New Password" required />
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required />
        <button type="submit">Reset Password</button>
      </form>
      <button id="backToLogin">Back to Login</button>
    </div>
  `;

  const resetForm = document.getElementById("resetForm") as HTMLFormElement;
  const backToLogin = document.getElementById("backToLogin") as HTMLButtonElement;

  backToLogin.addEventListener("click", () => renderAuth());

  resetForm.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const otp = (document.getElementById("resetOtp") as HTMLInputElement).value;
    const password = (document.getElementById("newPassword") as HTMLInputElement).value;
    const confirmPassword = (document.getElementById("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    showLoader();
    try {
      const data = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: { email, otp, password },
      });

     // localStorage.setItem("user", JSON.stringify(data.user));
      await renderAuth();
      showToast("Password reset successfully! Login with new Password.", "success");
    } catch (error: any) {
      showToast(error?.message || "Password reset failed", "error");
    } finally {
      hideLoader();
    }
  });

}
document.addEventListener("DOMContentLoaded", () => {
  init();
});