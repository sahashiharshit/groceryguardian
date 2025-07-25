import { apiFetch } from "../../services/api";
import { setPageTitle } from "../app";

setPageTitle("Inventory")
type PantryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  category?: string;
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

  view.innerHTML = `<h2>Inventory</h2><p>Loading Items...</p>`;

  try {
    const items: PantryItem[] = await apiFetch("/pantry", { method: "GET" });

    if (!Array.isArray(items) || items.length === 0) {
      view.innerHTML = `
        <h2>Inventory</h2>
        <p>No items in your inventory yet. Start by adding some!</p>
      `;
      return;
    }

    const list = document.createElement("div");
    list.className = "inventory-list";
    console.log(items);
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "inventory-card";

      const status = item.isAvailable === false ? "❌ Unavailable" : "✔️ Available";
      // 🔍 Expiration check
      let expiredTag = "";
      if (item.expirationDate) {
        const today = new Date();
        const expiry = new Date(item.expirationDate);
        if (expiry < today) {
          expiredTag = `<p class="expired-tag">⚠️ <strong>Expired on:</strong> ${expiry.toLocaleDateString()}</p>`;
        }
      }
      card.innerHTML = `
      <div class="card-left">
        <h3>${item.itemName}</h3>
        <p><strong>Qty:</strong> ${item.quantity} ${item.unit || ""}</p>
        ${item.category ? `<p><strong>Category:</strong> ${item.category}</p>` : ""}
        ${item.purchaseDate ? `<p><strong>Purchased:</strong> ${new Date(item.purchaseDate).toLocaleDateString()}</p>` : ""}
        ${item.expirationDate ? `<p><strong>Expires:</strong> ${new Date(item.expirationDate).toLocaleDateString()}</p>` : ""}
        ${expiredTag}
        ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ""}
          </div>
          <div class="card-right">
        <p><strong>Status:</strong> ${status}</p>
        </div>
      `;

      list.appendChild(card);
    });
    view.innerHTML = " ";
    view.appendChild(list);

  } catch (error: any) {
    console.error("Error fetching pantry items:", error);
    view.innerHTML = `
      <h2>Inventory</h2>
      <p>🚨 Error loading inventory. Try again later.</p>
    `;
  }


}