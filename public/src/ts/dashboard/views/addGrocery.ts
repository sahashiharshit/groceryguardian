import { apiFetch } from "../../services/api.js";
import { GroceryForm } from "../components/grocery/Form.js";
import { loadCSS } from "../utils/LoadCSS.js";
export type AddGroceryItems={

  itemname: string;
  quantity: string;
  unit?: string;
  notes?: string;
}
let groceryItems: AddGroceryItems[] = JSON.parse(localStorage.getItem("grocery-items") || "[]");
export function render() {
  loadCSS("/css/form.css");
  const view = document.getElementById("view") as HTMLElement;
  view.innerHTML = ""; // clear old content
  const form = GroceryForm((item:AddGroceryItems) => {
    groceryItems.push(item);
    localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
    render();
  });


  //Render the list
  const listWrapper = document.createElement("div");
  listWrapper.className="grocery-list";
  
  const heading = document.createElement("h2");
  heading.textContent="Added items";
  listWrapper.append(heading);
  const list = document.createElement("ul");

  groceryItems.forEach((item, index) => {

    const li = document.createElement("li");
    li.textContent = `${item.quantity} ${item.unit || ""} - ${item.itemname} ${item.notes ? `(${item.notes})` : ""}`;

    //delete button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑️";
    removeBtn.className = "action-btn remove-btn";
    removeBtn.onclick = () => {
      li.classList.add("fade-out");
      setTimeout(() => {

        groceryItems.splice(index, 1);
        localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
        render();
      }, 300);

    };

    // ✏️ Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "action-btn edit-btn";
    editBtn.onclick = () => {
      li.classList.add("edit-blink");
      setTimeout(() => li.classList.remove("edit-blink"), 300);
  
      const updatedName = prompt("Edit item name:", item.itemname);
      if (updatedName) {
        groceryItems[index].itemname = updatedName;
        localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
        render();
      }
    };
    li.append(editBtn, removeBtn);
    list.appendChild(li);
    listWrapper.appendChild(list)
  });

  // 🧾 Submit to DB button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add All to Database";
  submitBtn.className = "submit-all-btn ";
  submitBtn.onclick = async () => {
    try {
      console.log("Items to be submitted",groceryItems);
      await apiFetch("/api/grocery/add-grocery", {
        method: "POST",
        body:{ items: groceryItems }
      });

      alert("Groceries added successfully!");
      groceryItems.length = 0; // Clear items after success
      localStorage.removeItem("grocery-items");
      render(); // Re-render clean state
    } catch (err) {
      console.error(err);
      alert("Failed to submit groceries. Try again.");
    }
  };
  view.append(form, listWrapper);

  if (groceryItems.length > 0) {
    listWrapper.append(submitBtn);
  }

}