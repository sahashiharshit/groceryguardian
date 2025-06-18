

import { apiFetch } from "../../../services/api.js";
import { AddGroceryItems } from "../../views/addGrocery.js";
import { FormBuilder } from "../FormBuilder.js";

export async function GroceryForm(onSubmit:(item:AddGroceryItems)=>void):Promise<HTMLElement>{
 const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");
  
  const categoryOptions = await fetchCategories();
  
   const form = FormBuilder<AddGroceryItems>({
    id: "grocery-form",
    submitLabel: "Add Item",
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
          {value:"dozen",label:"Dozen"},
        ],
      },
      {
        name: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Leave note if any...",
      },
    ],
    onSubmit: (data:AddGroceryItems) => {
      console.log("Form Data:", data);
     onSubmit(data);
    },
  });

    wrapper.appendChild(form);
    return wrapper;
}
export async function fetchCategories():Promise<{value:string;label:string}[]> {
  try {
    const data = await apiFetch<{_id:string;name:string}[]>("/api/grocery/getcategories");
   
    return data.map((cat)=>({
      value:cat.name,
      label:cat.name,
    }));
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return [{ value: "", label: "Failed to load categories" }];
  }
}