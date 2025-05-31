import { renderHTML } from "../../utils/render.js";
import { FormBuilder } from "../FormBuilder.js";

export function GroceryForm(onSubmit){
 const wrapper = document.createElement("div");
  wrapper.classList.add("grocery-form-wrapper");
   const form = FormBuilder({
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
    onSubmit: (data) => {
      console.log("Form Data:", data);
      renderHTML("#app", `<pre>${JSON.stringify(data, null, 2)}</pre>`);
    },
  });

    wrapper.appendChild(form);
    return wrapper;
}