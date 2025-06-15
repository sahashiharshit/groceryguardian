
import { AddGroceryItems } from "../../views/addGrocery.js";
import { FormBuilder } from "../FormBuilder.js";

export function GroceryForm(onSubmit:(item:AddGroceryItems)=>void):HTMLElement{
 const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");
   const form = FormBuilder<AddGroceryItems>({
    id: "grocery-form",
    submitLabel: "Add Item",
    fields: [
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