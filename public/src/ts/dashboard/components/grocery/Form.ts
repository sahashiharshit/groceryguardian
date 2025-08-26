

import { apiFetch } from "../../../services/api.js";

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