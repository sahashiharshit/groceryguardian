import { apiFetch } from "../../services/api";
import { loadCSS } from "../utils/LoadCSS";

interface PantryItem {
 _id: string;
  itemName: string;
  quantity: number;
  category?: string;
  addedBy: string;
  purchaseDate?: string;
  expirationDate?: string;
  notes?: string;
  isAvailable?: boolean;

}

export async function render():Promise<void>{
    
   const view =document.getElementById("view");
   if(!view) return;
   
   view.innerHTML=`<h2>Inventory</h2><p>Loading Items...</p>`;
    loadCSS('../css/inventory.css');
   try {
    const items:PantryItem[] = await apiFetch("/api/pantry",{method:"GET"});
    if(items.length===0){
    view.innerHTML =`
     <h2>Inventory</h2>
        <p>No items in your inventory yet. Start by adding some!</p>
    `;
    return;
    }
    const list = document.createElement("div");
    list.className = "inventory-list";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "inventory-card";
      card.innerHTML = `
        <h3>${item.itemName}</h3>
        <p><strong>Qty:</strong> ${item.quantity}</p>
        ${item.category ? `<p><strong>Category:</strong> ${item.category}</p>` : ""}
        ${item.expirationDate ? `<p><strong>Expires:</strong> ${new Date(item.expirationDate).toLocaleDateString()}</p>` : ""}
        <p><strong>Status:</strong> ${item.isAvailable ? "✔️ Available" : "❌ Unavailable"}</p>
      `;
      list.appendChild(card);
    });
    view.innerHTML = `<h2>Inventory</h2>`;
    view.appendChild(list);
   } catch (error:any) {
    console.error("Error fetching pantry items:", error);
    view.innerHTML = `
      <h2>Inventory</h2>
      <p>Error loading inventory. Try again later.</p>
    `;
   }
   
  
}