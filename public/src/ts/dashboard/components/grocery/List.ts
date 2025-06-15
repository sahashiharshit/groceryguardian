import { apiFetch } from "../../../services/api";
import { scanBarcodeAndMatch, scanPhotoAndMatch } from "../../utils/scanner-utils";

type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'purchased' | string;
  notes?: string;
}

export function GroceryList(items: GroceryItem[] = []): HTMLUListElement {
  const listElement = document.createElement("ul");
  listElement.id = "grocery-list";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    const itemId = item.id;
    const itemInfo = document.createElement("div");
    itemInfo.className = "item-info";
    itemInfo.innerHTML = `
      <strong>${item.name}</strong> - ${item.quantity} ${item.unit} ${item.notes}
      
    `;

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "0.5rem";
    const purchasedBtn = document.createElement("button");
    purchasedBtn.className = "purchase-btn"
    purchasedBtn.innerHTML = "✅ Purchase";

    purchasedBtn.onclick = async () => {
      const useBarcode = confirm("Use barcode scanner?\nCancel = Use photo scanner");
      const validateItem = useBarcode?await scanBarcodeAndMatch(itemId):await scanPhotoAndMatch(item.name);
      if(!validateItem){
      alert("Item does not match scanned data.");
      return;
      }
    
      try {
        await apiFetch(`/api/grocery/movetoinventory/${itemId}`, { method: "POST" });
        li.remove();
        alert("Moved Successfully");
      } catch (error) {
        console.error("Failed to add item in pantry");
        alert("Could not add item in inventory");
      }


    };
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "🗑️ Delete";

    deleteBtn.onclick = async () => {
      try {

        await apiFetch(`/api/grocery/grocery-list/${itemId}`, { method: "DELETE" });
        li.remove();

      } catch (error: any) {
        console.error("Failed to delete item:", error);
        alert("Could not delete item. Try again.");
      }

    };
    buttonGroup.appendChild(purchasedBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(itemInfo);
    li.appendChild(buttonGroup);
    listElement.appendChild(li);
  });

  return listElement;
}
