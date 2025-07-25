import { apiFetch } from "../../services/api";
import { setPageTitle } from "../app";

setPageTitle("Inventory")
type PantryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  barcode?: string;
  category?: {
    _id: string;
    name: string;
  }
  unit?: string;
  addedBy: string;
  purchaseDate?: string;
  expirationDate?: string;
  notes?: string;
  isAvailable?: boolean;

}

export async function render(): Promise<void> {

  const view = document.getElementById("view");
  if (!view) return;



  try {
    const items: PantryItem[] = await apiFetch("/pantry", { method: "GET" });

    if (!Array.isArray(items) || items.length === 0) {
      view.innerHTML = `
        <h2>Inventory</h2>
        <p>No items in your inventory yet. Start by adding some!</p>
      `;
      return;
    }
    // 🧠 Group items
    const withBarcode: PantryItem[] = [];
    const withExpiry: PantryItem[] = [];
    const withoutExpiry: PantryItem[] = [];

    items.forEach(item => {
      if (item.barcode) {
        withBarcode.push(item);
      } else if (item.expirationDate) {
        withExpiry.push(item);
      } else {
        withoutExpiry.push(item);
      }

    });
    view.innerHTML = `<h2>Inventory</h2>`;
    view.appendChild(renderGroup("📦 Items with Barcode", withBarcode));
    view.appendChild(renderGroup("📅 Items with Expiration Date", withExpiry));
    view.appendChild(renderGroup("⏲️ Items without Expiration", withoutExpiry));

  } catch (error: any) {
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

function renderGroup(title: string, items: PantryItem[]): HTMLElement {

  const groupWrapper = document.createElement("div");
  groupWrapper.className = "inventory-group";

  const heading = document.createElement("h3");
  heading.textContent = title;
  groupWrapper.appendChild(heading);

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No items in this category.";
    groupWrapper.appendChild(empty);
    return groupWrapper;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "inventory-card";

    const status = item.isAvailable === false ? "❌ Unavailable" : "✔️ Available";
    
    let expiredTag = "";
    if (item.expirationDate) {
      const today = new Date();
      const expiry = new Date(item.expirationDate);
      if (expiry < today) {
        expiredTag = `<p class="expired-tag">⚠️ <strong>Expired on:</strong> ${expiry.toLocaleDateString()}</p>`;
         card.classList.add("expired");
      }
    }

    card.innerHTML = `
      <div class="card-left">
        <h3>${item.itemName}</h3>
        <p><strong>Qty:</strong> ${item.quantity} ${item.unit || ""}</p>
        ${item.category ? `<p><strong>Category:</strong> ${item.category.name}</p>` : ""}
        ${item.purchaseDate ? `<p><strong>Purchased:</strong> ${new Date(item.purchaseDate).toLocaleDateString()}</p>` : ""}
        ${item.expirationDate ? `<p><strong>Expires:</strong> ${new Date(item.expirationDate).toLocaleDateString()}</p>` : ""}
        ${expiredTag}
        ${item.barcode ? `<p><strong>Barcode:</strong> ${item.barcode}</p>` : ""}
        ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ""}
      </div>
      <div class="card-right">
        <p><strong>Status:</strong> ${status}</p>
      </div>
    `;

    groupWrapper.appendChild(card);
  });

  return groupWrapper;
}