import { renderDashboardLayout } from "./dashboard/app";
import { apiFetch } from "./services/api";


export function initAuth(onAuthSuccess:()=>void): void {

  const loginform = document.getElementById("login-form") as HTMLFormElement | null;
  const signupform = document.getElementById("signup-form") as HTMLFormElement | null;

  if (loginform) {

    loginform.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = (document.getElementById("loginemail") as HTMLInputElement).value;
      const password = (document.getElementById("loginpassword") as HTMLInputElement).value;

      try {
        const data = await apiFetch<{ accessToken: string }>("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        localStorage.setItem("accesstoken", data.accessToken);
        document.body.className="";
        onAuthSuccess();
        
      } catch (error: any) {
        alert("Login failed. Please try again.");
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
        const data = await apiFetch<{ accessToken: string }>("/api/auth/register", {
          method: "POST",
          body: { name, email, mobileNo, password },
        });
        localStorage.setItem("accesstoken", data.accessToken);
         document.body.className="";
        onAuthSuccess();
        
      } catch (error: any) {
        console.error("Error:", error);
        alert("Signup failed. Please try again.");
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
  document.querySelector(".mobile-menu-icon span")?.addEventListener("click", () => {
    document.querySelector(".mobile-drawer")?.classList.toggle("show");
  });

  document.querySelector(".drawer-login")?.addEventListener("click", () => loginBtn?.click());
  document.querySelector(".drawer-signup")?.addEventListener("click", () => signupBtn?.click());



}