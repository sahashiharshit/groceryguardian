
import { apiFetch } from "../../services/api.js";
import { setPageTitle } from "../app.js";
import { AddGroceryItem, GroceryForm } from "../components/grocery/Form.js";

import { GroceryList } from "../components/grocery/List.js";
import { Modal } from "../components/Modal.js";
import { loadCSS } from "../utils/loadcss.js";
setPageTitle("Groceries")
type GroceryItem = {

  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
  barcode?:string;
}
type ApiGroceryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
  barcode?:string;
}
type GroceryApiResponse = {
  groceries: ApiGroceryItem[];
}
export async function render(): Promise<void> {
  const view = document.getElementById('view');
  
  if (!view) {
    console.warn('View container not found');
    return;
  }
  loadCSS("../css/grocerypage.css");
  loadCSS("../css/form.css");
  loadCSS("../css/modal.css");

  try {

    const data = await apiFetch<GroceryApiResponse>("/api/grocery/grocery-list", { method: "GET" });
   
    const simplifiedList: GroceryItem[] = data.groceries.map((item) => ({
      id: item._id,
      name: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      notes: item.notes,
      barcode:item.barcode,
    }));
   
    const layout = document.createElement("div");
    layout.className = "grocery-layout";
    
    const list = GroceryList(simplifiedList);

    //Create the modal (initially hidden)
    const form = await GroceryForm(async (item:AddGroceryItem,barcodeMatched) => {
      try {
        await apiFetch<ApiGroceryItem>("/api/grocery/add-grocery", {
          method: "POST",
          body: { items: [item] },
        });        
        alert("Item added successfully!");
        (groceryModal as any).closeModal();
        render();
      } catch (error) {
        console.error("❌ Failed to add item",error);
        alert("Failed to add item. Please try again.");
      }
    });
    
    const groceryModal = Modal(form,"grocery-modal");
    //Add Groceries button
    const addBtn = document.createElement("button") as HTMLButtonElement;
    addBtn.textContent = "Add Groceries";
    addBtn.className = "add-grocery-btn";
    addBtn.onclick = () => (groceryModal as any).openModal();

    //assemble Layout
    layout.appendChild(addBtn);
   
    layout.appendChild(list);
    layout.appendChild(groceryModal);

    view.innerHTML = '';
     if(data.groceries.length ===0){
    view.innerHTML="<h3>No Grocery List created</h3>";
    }
    view.appendChild(layout)

  } catch (error) {
    console.error('Failed to load groceries:', error);
    const view = document.getElementById('view');
    if (view) {
      view.innerHTML = `<div class="error">
      <p>Error loading groceries. Please try again later.</p>
      <button id="retry-load">Retry</button>
      </div>`;
      document.getElementById("retry-load")?.addEventListener("click", () => {
        render();
      });
    }
  }



}



