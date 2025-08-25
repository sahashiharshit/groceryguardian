import { exp } from "@tensorflow/tfjs";
import { apiFetch } from "../../services/api";
import { showToast } from "../../services/toast.js";
import { setPageTitle } from "../app";

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
};

export async function render(): Promise<void> {
  const view = document.getElementById("view");
  if (!view) return;

  setPageTitle("Inventory");

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
      <div class="tab-content" id="barcode"></div>
      <div class="tab-content hidden" id="expiry"></div>
      <div class="tab-content hidden" id="no-expiry"></div>
    `;
    const barcodeContainer = document.getElementById("barcode");
    const expiryContainer = document.getElementById("expiry");
    const noExpiryContainer = document.getElementById("no-expiry");
    barcodeContainer?.appendChild(renderCards(withBarcode));
    expiryContainer?.appendChild(renderCards(withExpiry));
    noExpiryContainer?.appendChild(renderCards(withoutExpiry));

    // Tab click handling
    const buttons = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");

        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        contents.forEach(c => {
          if (c.id === target) c.classList.remove("hidden");
          else c.classList.add("hidden");
        });
      });
    });
    addRefreshButton();
    checkLowStock();
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

function renderCards(items: PantryItem[]): HTMLElement {
  const container = document.createElement("div");
  container.className ="inventory-list";

  if (!items.length){
    container.innerHTML= `<p>No items in this category.</p>`;
    return container;
  } 

  items.forEach(item => {
    const card = document.createElement("div");
    const expired = item.expirationDate && new Date(item.expirationDate) < new Date();
    card.className = `inventory-card ${expired ? "expired" : ""}`;
    const status = item.isAvailable === false ? "❌ Unavailable" : "✔️ Available";
    
    card.innerHTML = `
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
    `;
    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.style.marginTop = "0.5rem";
    deleteBtn.onclick = async () => {
      const confirmDelete = confirm(`Are you sure you want to delete "${item.itemName}"?`);
      if (!confirmDelete) return;

      try {
        await apiFetch(`/pantry/${item._id}`, { method: "DELETE" });
        card.remove();
        showToast("Item deleted successfully", "success");
      } catch (error) {
        showToast("Could not delete item. Try again.", "error");
      }
    };

    card.querySelector(".card-left")?.appendChild(deleteBtn);
    addAvailabilityToggle(card, item);
    if(expired) card.style.border="2px solid red";

    container.appendChild(card);
  });

  return container;
}

//Availability toggle
function addAvailabilityToggle(card: HTMLElement, item: PantryItem): void {
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = item.isAvailable? "Mark Available" : "Mark Unavailable";
   toggleBtn.className = "availability-btn";
  toggleBtn.style.marginTop = "0.5rem";
  toggleBtn.onclick = async () => {
   
    try {
     const updatedItem = await apiFetch<PantryItem>(`/pantry/${item._id}`,{
      method:"PUT",
      body:{isAvailable: !item.isAvailable}
     });
     item.isAvailable = updatedItem.isAvailable;
    toggleBtn.textContent = updatedItem.isAvailable ? "Mark Unavailable" : "Mark Available";
      const statusEl = card.querySelector(".card-right p");
      if (statusEl) statusEl.innerHTML = `<strong>Status:</strong> ${updatedItem.isAvailable ? "✔️ Available" : "❌ Unavailable"}`;
      showToast("Availability updated", "success");
     
    } catch (error) {
       showToast("Failed to update availability", "error");
    }
  };
  card.querySelector(".card-left")?.appendChild(toggleBtn);
}

function addRefreshButton() {
  const view = document.getElementById("view");
  if (!view) return;

  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "🔄 Refresh Inventory";
  refreshBtn.className = "refresh-btn";
  refreshBtn.style.margin = "1rem auto";
  refreshBtn.style.display = "block";
  refreshBtn.onclick = () => render();

  view.prepend(refreshBtn);
}

// Low stock check
async function checkLowStock(threshold = 1) {
  try {
    const lowStockItems: PantryItem[] = await apiFetch(`/pantry/check/low-stock?threshold=${threshold}`);
    if (lowStockItems.length > 0) {
      lowStockItems.forEach(item => showToast(`Low stock: ${item.itemName} (${item.quantity})`, "info"));
    }
  } catch (err) {
    console.error("Failed to fetch low stock items", err);
  }
}