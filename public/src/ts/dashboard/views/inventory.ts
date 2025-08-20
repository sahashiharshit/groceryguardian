import { apiFetch } from "../../services/api";
import { showToast } from "../../services/toast.js";
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
   const withBarcode = items.filter((item) => item.barcode);
    const withExpiry = items.filter((item) => item.expirationDate);
    const withoutExpiry = items.filter((item) => !item.expirationDate);

    view.innerHTML = `
     
      <div class="tab-bar">
        <button class="tab-btn active" data-tab="barcode">📦 With Barcode</button>
        <button class="tab-btn" data-tab="expiry">📅 With Expiry</button>
        <button class="tab-btn" data-tab="no-expiry">⏲️ Without Expiry</button>
      </div>
      <div class="tab-content" id="barcode">${renderCards(withBarcode)}</div>
      <div class="tab-content hidden" id="expiry">${renderCards(withExpiry)}</div>
      <div class="tab-content hidden" id="no-expiry">${renderCards(withoutExpiry)}</div>
    `;

    // Tab click handling
    const buttons = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");

        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        contents.forEach(c => {
          if (c.id === target) {
            c.classList.remove("hidden");
          } else {
            c.classList.add("hidden");
          }
        });
      });
    });
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

function renderCards(items: PantryItem[]): string {
  if (!items.length) return `<p>No items in this category.</p>`;

  return `
    <div class="inventory-list">
      ${items.map(item => {
        const status = item.isAvailable === false ? "❌ Unavailable" : "✔️ Available";
        const expired = item.expirationDate && new Date(item.expirationDate) < new Date();
        return `
          <div class="inventory-card ${expired ? "expired" : ""}">
            <div class="card-left">
              <h3>${item.itemName}</h3>
              <p><strong>Qty:</strong> ${item.quantity} ${item.unit || ""}</p>
              ${item.category ? `<p><strong>Category:</strong> ${item.category.name}</p>` : ""}
              ${item.purchaseDate ? `<p><strong>Purchased:</strong> ${new Date(item.purchaseDate).toLocaleDateString("en-GB")}</p>` : ""}
              ${item.expirationDate ? `<p><strong>Expires:</strong> ${new Date(item.expirationDate).toLocaleDateString("en-GB")}</p>` : ""}
              ${expired ? `<p class="expired-tag">⚠️ <strong>Expired</strong></p>` : ""}
              ${item.barcode ? `<p><strong>Barcode:</strong> ${item.barcode}</p>` : ""}
              ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ""}
            </div>
            <div class="card-right">
              <p><strong>Status:</strong> ${status}</p>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}