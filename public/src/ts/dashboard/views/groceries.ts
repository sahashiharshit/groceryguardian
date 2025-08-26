
import { apiFetch } from "../../services/api.js";
import { showToast } from "../../services/toast.js";
import { setPageTitle } from "../app.js";
import { FormBuilder } from "../components/FormBuilder.js";
import { AddGroceryItem, BarcodeResponse, GroceryForm } from "../components/grocery/Form.js";
import { Modal } from "../components/Modal.js";

import { scanBarcodeAndReturn } from "../utils/scanner-utils.js";

type GroceryItem = {

  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
  barcode?: string;
  addedBy?: string;
}
type ApiGroceryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
  barcode?: string;
  addedBy?: string;
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
  setPageTitle("Groceries")

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const data = await apiFetch<GroceryApiResponse>("/grocery/grocery-list", { method: "GET" });

    const simplifiedList: GroceryItem[] = data.groceries.map((item) => ({
      id: item._id,
      name: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      notes: item.notes,
      barcode: item.barcode,
      addedBy: item.addedBy,
    }));

    const layout = document.createElement("div");
    layout.className = "grocery-layout";

    const list = document.createElement("ul");
    list.id = "grocery-list";

    simplifiedList.map((item) => {

      const li = document.createElement("li");
      const itemId = item.id;
      const itemInfo = document.createElement("div");
      itemInfo.className = "item-info";
      itemInfo.innerHTML = `
    <strong> ${item.name}</strong> - ${item.quantity} ${item.unit} ${item.notes ? `(${item.notes})` : ""}
  
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
              showToast("❌ No barcode detected. Please try again.","error");
              return;
            }
            const barcodeDoc = await apiFetch<BarcodeResponse>(`/grocery/barcode/${scannedCode}`);

            if (!barcodeDoc || barcodeDoc?.id !== item.barcode) {
              showToast("❌ Scanned barcode does not match this item.", "error");
              return;
            }
          } catch (error) {

            showToast("Something went wrong during barcode scan.", "error");
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
            await apiFetch(`/grocery/movetoinventory/${itemId}`, { method: "POST", body: { expirationDate } });
            li.remove();
            expirationModal.closeModal();
            showToast("Moved Successfully",'success');
          } catch (error) {
            showToast("Could not add item in inventory", "error");
          }

        });
        const expirationModal = Modal(expirationForm, "expiration-modal");
        expirationModal.openModal();
      };
      buttonGroup.appendChild(purchasedBtn);
      if (item.addedBy === user?.id) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "Delete";

        deleteBtn.onclick = async () => {
          try {
            const confirmDelete = confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) return;

            await apiFetch(`/grocery/grocery-list/${itemId}`, { method: "DELETE" });
            li.remove();
            showToast("Item deleted successfully.", "success");
          } catch (error: any) {

            showToast("Could not delete item. Try again.", "error");
          }

        };

        buttonGroup.appendChild(deleteBtn);
      }
      li.appendChild(itemInfo);
      li.appendChild(buttonGroup);
      list.appendChild(li);
    });
    //Create the modal (initially hidden)
    const form = await GroceryForm(async (item: AddGroceryItem) => {
      try {
        await apiFetch<ApiGroceryItem>("/grocery/add-grocery", {
          method: "POST",
          body: { items: [item] },
        });
        showToast("Item added successfully!", "success");
        groceryModal.closeModal();
        render();
      } catch (error) {
        showToast("Failed to add item. Please try again.", "error");
      }
    });

    const groceryModal = Modal(form, "grocery-modal");
    //Add Groceries button
    const addBtn = document.createElement("button") as HTMLButtonElement;
    addBtn.textContent = "Add";
    addBtn.className = "add-grocery-btn";
    addBtn.onclick = () => groceryModal.openModal();

    //assemble Layout
   
    layout.appendChild(list);
    

    view.innerHTML = '';
    if (data.groceries.length === 0) {
      view.innerHTML = "<h3>No Grocery List created</h3>";
    }
    view.appendChild(layout)
    view.appendChild(addBtn);
  } catch (error) {
    const res =  await apiFetch('/auth/refresh');
    if(res){
    render();
    }
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
