


import { GroceryHeader } from "../components/grocery/header.js";
import { GroceryList } from "../components/grocery/List.js";

let groceryItems = [];
export function render() {
 
  const app = document.getElementById("app");
  app.innerHTML = ""; // clear old content

    const header = GroceryHeader();
    const list = GroceryList(groceryItems);
    
  app.append(header,list);
}
