import { GroceryForm } from "../components/grocery/Form.js";
import { loadCSS } from "../utils/LoadCSS.js";

export function render(){
 loadCSS("/dashboard/styles/form.css");
  const app = document.getElementById("app");
  app.innerHTML = ""; // clear old content
const form = GroceryForm((item)=>{
        groceryItems.push(item);
        render();
    });
    app.append(form);
}