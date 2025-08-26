

import { apiFetch } from "../../../services/api.js";
import { showToast } from "../../../services/toast.js";
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
export async function GroceryForm(onSubmit: (item: AddGroceryItem) => void): Promise<HTMLElement> {
  const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");

  // Fetch categories for the select field
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
          { value: "bottle", label: "Bottle" },
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

    ],
    buttons: [

      {
        label: "🔄 Reset",
        className: "reset-btn",
        onClick: (form) => form.reset(),
      },
    ],
    onSubmit: (data: AddGroceryItem) => {

      onSubmit(data);
      form.reset();

    },
  });

  wrapper.appendChild(form);

  return wrapper;
}

export async function InventoryForm(onSubmit: (item: AddGroceryItem, barcodeMatched: boolean) => void): Promise<HTMLElement> {
  const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");
  let barcodeMatched = false;
  // Fetch categories for the select field
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
          { value: "bottle", label: "Bottle" },
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
        name: "expirationDate",
        label: "Expiration Date",
        type: "date",
        placeholder: "Select expiration date",
        className: "full-width",
        required: true,
        min: new Date().toISOString().split("T")[0], // today
        max: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split("T")[0] // 5 years from now
      },
      {
        name: "barcode",
        label: "Barcode",
        placeholder: "Scaned code will appear here",
        className: "full-width",
      
        type: "text"
      },

    ],
    buttons: [
      {
        label: "📷 Scan Barcode",
        className: "scan-btn",
        onClick: async (form) => {
          const scanned = await scanBarcodeAndReturn();

          if (!scanned) return;


          const barcodeInput = form.querySelector<HTMLInputElement>('input[name="barcode"]');
          if (!barcodeInput) return;

          const code = scanned.trim();
          barcodeInput.value = code;
          
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
            showToast("Barcode not found, Please input item info manually.");
            enableFormFields(form, true,true,true);
          }
        },
      },
      {
        label: "🔄 Reset",
        className: "reset-btn",
        onClick: (form) => {
          form.reset();
          barcodeMatched = false;
          enableFormFields(form, false,true,true);
        },
      },
    ],
    onSubmit: (data: AddGroceryItem) => {
      console.log(data);
      onSubmit(data, barcodeMatched);
      form.reset();
      barcodeMatched = false;
      enableFormFields(form, false,true,true);
    },
  });
  function enableFormFields(form: HTMLFormElement, enabled: boolean,keepBarcodeLocked=true,keepExpirationEnabled=true) {

    const allInputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input,select,textarea"
    );
    allInputs.forEach((el) => {
      if (keepBarcodeLocked && el.name === "barcode") {
        (el as HTMLInputElement).readOnly = true;
        el.disabled=false;
      }else if (keepExpirationEnabled && el.name === "expirationDate") {
        el.disabled = false;
      }else{
        el.disabled=!enabled;
      }
    });
  }
  enableFormFields(form, false,true,true);
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
    return [{ value: "", label: "Failed to load categories" }];
  }
}
