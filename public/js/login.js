window.onload = function () {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.replace("/dashboard/index.html");
  }
  console.log("Welcome to the application!");
  const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
  const loginform = document.getElementById("login-form");
  const signupform = document.getElementById("signup-form");
  const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
const drawer = document.querySelector('.mobile-drawer');

  loginBtn.addEventListener("click", function () {
  loginBtn.classList.add("active");
  signupBtn.classList.remove("active");
  loginform.classList.add("active");
  signupform.classList.remove("active");
  
  });
  signupBtn.addEventListener("click", function () {
  signupBtn.classList.add("active");
  loginBtn.classList.remove("active");
  signupform.classList.add("active");
  loginform.classList.remove("active");
  });
  
  mobileMenuIcon.addEventListener('click', function () {
  
  drawer.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-drawer .auth-btn').forEach(btn=>{
    btn.addEventListener('click', function () {
      drawer.classList.remove('open');
    });
  
  });
  
  loginform.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginemail").value;
    const password = document.getElementById("loginpassword").value;

    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
       if (!response.ok) throw new Error("Login failed");
      return response.json();
      }).then((data) => {
      localStorage.setItem("token", data.token);
      window.location.replace("/dashboard/index.html");
      })
      .catch((error) => {
       
        alert("Login failed. Please try again.");
      });
  });
  signupform.addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.getElementById("name").value;
    const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  
  fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, email }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Signup successful! You can now log in.");
        loginBtn.click(); // Switch to login form
      } else {
        throw new Error("Signup failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Signup failed. Please try again.");
    });
  
  });
  
};
