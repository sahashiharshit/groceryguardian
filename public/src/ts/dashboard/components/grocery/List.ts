import { apiFetch } from "../../../services/api";
import { scanBarcodeAndReturn, scanPhotoAndMatch } from "../../utils/scanner-utils";

import { FormBuilder } from "../FormBuilder";
import { Modal } from "../Modal";
import { BarcodeResponse } from "./Form";

type GroceryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'purchased' | string;
  notes?: string;
  barcode?: string;
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
      <strong>${item.name}</strong> - ${item.quantity} ${item.unit} ${item.notes ? `(${item.notes})` : ""}
      
    `;

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "0.5rem";
    const purchasedBtn = document.createElement("button");
    purchasedBtn.className = "purchase-btn"
    purchasedBtn.innerHTML = "Purchase";

    purchasedBtn.onclick = async () => {

      if (item.barcode) {
        try {
          const scannedCode = await scanBarcodeAndReturn();
          if (!scannedCode) {
            alert("❌ No barcode detected. Please try again.");
            return;
          }
          const barcodeDoc = await apiFetch<BarcodeResponse>(`/api/grocery/barcode/${scannedCode}`);

          if (!barcodeDoc || barcodeDoc?.id !== item.barcode) {
            alert("❌ Scanned barcode does not match this item.");
            return;
          }
        } catch (error) {
          console.error("📷 Barcode scan failed:", error);
          alert("Something went wrong during barcode scan.");
          return;
        }

      } else {
        const confirmMove = confirm(
          `⚠️ This item doesn't have a barcode.\nDo you want to move it to pantry anyway?`
        );
        if (!confirmMove) return;

      }
      // Prompt user to select an expiration date (can be skipped if desired)
      const expirationForm = createExpirationForm(async (expirationDate) => {
        try {
          await apiFetch(`/api/grocery/movetoinventory/${itemId}`, { method: "POST", body: { expirationDate } });
          li.remove();
          (expirationModal as any).closeModal();
          alert("Moved Successfully");
        } catch (error) {
          console.error("Failed to add item in pantry");
          alert("Could not add item in inventory");
        }

      });
      const expirationModal = Modal(expirationForm, "expiration-modal");
      document.body.appendChild(expirationModal);
      (expirationModal as any).openModal();
      



    };
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "Delete";

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

function createExpirationForm(onSubmit: (expirationDate: string | null) => void): HTMLElement {

  const form = FormBuilder<{
    expirationDate: string;
  }>({
    id: "expiration-form",
    className: "expiration-form-grid",
    submitLabel: "✔️ Confirm",
    fields: [
      {
        name: "expirationDate",
        label: "Expiration Date",
        type: "text", // still use "text" to allow type="date" override
        required: false,
        placeholder: "Select expiration date",
        className: "full-width",
      },
    ],
    onSubmit: (data) => {
      const date = data.expirationDate?.trim();
      onSubmit(date || null);
    },
  });
  const btnWrapper = document.createElement("div");
  btnWrapper.className = "form-button-group";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "❌ Skip";
  cancelBtn.className = "cancel-expiration";

  cancelBtn.onclick = () => onSubmit(null);

  // Move submit button outside form if needed or keep both inside wrapper
  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) {
    btnWrapper.appendChild(submitBtn);
  }
  btnWrapper.appendChild(cancelBtn);

  form.appendChild(btnWrapper);

  // Set date input properly
  const input = form.querySelector<HTMLInputElement>('input[name="expirationDate"]');
  if (input) {
    input.type = "date";
  }

  return form;
}