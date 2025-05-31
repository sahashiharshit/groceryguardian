import { apiFetch } from "../api.js";
import { renderHTML } from "../utils/render.js";

export async function render() {
 
  try {
    const user = localStorage.getItem("userinfo");
    if (user) {
   renderHTML("#app",`<h2>Welcome</h2>
        <p>${user} </p>
        `) 
     
    } else {
      const data = await apiFetch(`/api/users/`);
      const user = data.user;
      localStorage.setItem('userinfo',user.name);
      renderHTML("#app",`<h2>Welcome</h2>
        <p>${user.name} </p>
        `);
    }
  } catch (error) {
    console.error(error);
   renderHTML("#app",`<p>Failed to load User 😓</p>`)
  }
}
