import { apiFetch } from "../api.js";
import { GroceryHeader } from "../components/grocery/header.js";
import { GroceryList } from "../components/grocery/List.js";
import { loadCSS } from "../utils/LoadCSS.js";
export async function render() {
  loadCSS("/dashboard/styles/grocerypage.css");
  const data = await apiFetch("/api/grocery/grocerylist", "GET");
  const simplifiedList = data.groceries.map((item) => ({
    id: item._id,
    name: item.itemName,
    quantity: item.quantity,
    unit: item.unit,
    status: item.status,
  }));

  const app = document.getElementById("app");
  app.innerHTML = ""; // clear old content
  const header = GroceryHeader();
  const list = GroceryList(simplifiedList);
  app.append(header, list);
}
