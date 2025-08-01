

import { apiFetch } from "../../../services/api.js";
import { scanBarcodeAndReturn } from "../../utils/scanner-utils.js";
import { FormBuilder } from "../FormBuilder.js";

export type BarcodeResponse = {
  id: string;
  code: string;
  itemName: string;
  unit: string;
  quantity: number;
  category: string;
};
export type AddGroceryItem = {
  itemname: string;
  quantity: string;
  unit?: string;
  notes?: string;
  barcode?: string;
  category?: string;
}
export async function GroceryForm(onSubmit: (item: AddGroceryItem, barcodeMatched: boolean) => void): Promise<HTMLElement> {
  const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");
  let barcodeMatched = false;
  const categoryOptions = await fetchCategories();

  const form = FormBuilder<AddGroceryItem>({
    id: "grocery-form",
    submitLabel: "Add Item",
    className: "grocery-form-grid",
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [{ value: "", label: "Select a Category" }, ...categoryOptions],
        required: true,
      },
      { name: "itemname", label: "Item Name", required: true, minLength: 3 },
      {
        name: "quantity",
        label: "Quantity",
        required: true,
        placeholder: "How much you want...",
      },
      {
        name: "unit",
        label: "Units",
        type: "select",
        options: [
          { value: "", label: "Select One" },
          { value: "pcs", label: "Pieces" },
          { value: "kg", label: "Kilogram" },
          { value: "g", label: "Gram" },
          { value: "liters", label: "Liters" },
          { value: "ml", label: "Mili Liters" },
          { value: "packs", label: "Packs" },
          { value: "other", label: "Not Sure" },
          { value: "dozen", label: "Dozen" },
        ],
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Leave note if any...",
        className: "full-width"
      },
      {
        name: "barcode",
        label: "Barcode",
        placeholder: "Scan or enter code",
        type: "text"
      },
    ],
    buttons: [
      {
        label: "📷 Scan Barcode",
        className: "scan-btn",
        onClick: async (form) => {
          const scanned = await scanBarcodeAndReturn();

          if (scanned) {

            const barcodeInput = form.querySelector<HTMLInputElement>('input[name="barcode"]');

            if (barcodeInput) {
              const handler = async () => {
                const code = barcodeInput.value.trim();
                if (!code) return;
                try {

                  const itemData = await apiFetch<BarcodeResponse>(`/grocery/barcode/${code}`);

                  const nameField = form.querySelector<HTMLInputElement>('input[name="itemname"]');
                  const qtyField = form.querySelector<HTMLInputElement>('input[name="quantity"]');
                  const unitField = form.querySelector<HTMLSelectElement>('select[name="unit"]');
                  const categoryField = form.querySelector<HTMLSelectElement>('select[name="category"]');
                  if (itemData.itemName && nameField) nameField.value = itemData.itemName;
                  if (itemData.unit && unitField) unitField.value = itemData.unit;
                  if (itemData.quantity && qtyField) qtyField.value = String(itemData.quantity);
                  if (itemData.category && categoryField) categoryField.value = itemData.category;
                  barcodeMatched = true;
                } catch (error) {
                  barcodeMatched = false;
                  console.warn(`Barcode ${code} not found.`);
                  alert("barcode not found input item info manually.")
                }
              };
              barcodeInput.removeEventListener("change", handler);
              barcodeInput.addEventListener("change", handler);

              barcodeInput.value = scanned;
              barcodeInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        },
      },
      {
        label: "🔄 Reset",
        className: "reset-btn",
        onClick: (form) => form.reset(),
      },
    ],
    onSubmit: (data: AddGroceryItem) => {

      onSubmit(data, barcodeMatched);
      form.reset();
      barcodeMatched = false;
    },
  });

  wrapper.appendChild(form);

  return wrapper;
}
export async function fetchCategories(): Promise<{ value: string; label: string }[]> {
  try {
    const data = await apiFetch<{ _id: string; name: string }[]>("/grocery/getcategories");

    return data.map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return [{ value: "", label: "Failed to load categories" }];
  }
}