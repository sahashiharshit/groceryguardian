import { apiFetch } from "../../services/api.js";
import { renderHTML } from "../utils/render.js";

interface UserInfo{
user: any;

id:string;
name:string;
email:string;
createdAt:string;
}

export async function render():Promise<void> {
 
  try {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername!=="undefined") {
   renderHTML("#view",`<h2>Welcome</h2>
        <p>${storedUsername} </p>
        `) 
     
    } else {
      const response= await apiFetch<UserInfo>(`/api/users/getuser`,{method:"GET"});
      const username = response.user.name; 
    
      localStorage.setItem('username',username);
      renderHTML("#view",`<h2>Welcome</h2>
        <p>${username} </p>
        `);
    }
  } catch (error) {
    console.error(error);
   renderHTML("#view",`<p>Failed to load User 😓</p>`)
  }
}
