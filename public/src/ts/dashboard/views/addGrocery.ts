// import { apiFetch } from "../../services/api.js";
// import { GroceryForm } from "../components/grocery/Form.js";
// import { loadCSS } from "../utils/LoadCSS.js";
// export type AddGroceryItems = {
  

//   itemname: string;
//   quantity: string;
//   unit?: string;
//   notes?: string;
//   barcode?:string;
//   category?:string;
//   }
// let groceryItems: AddGroceryItems[] = JSON.parse(localStorage.getItem("grocery-items") || "[]");


// export async function render() {
//   loadCSS("/css/form.css");
//   const view = document.getElementById("view") as HTMLElement;
//   view.innerHTML = ""; // clear old content
//   //Form setup
//   const form = await GroceryForm((item: AddGroceryItems) => {
//     groceryItems.push(item);
//     localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
//     renderList(listWrapper);
    
//   });

//   view.appendChild(form);

//   const listWrapper = document.createElement("div");
//   listWrapper.className = "grocery-list";

//   const heading = document.createElement("h2");
//   heading.textContent = "Added items";
//   listWrapper.appendChild(heading);

//   view.appendChild(listWrapper);
//   renderList(listWrapper);


// }

// function renderList(listWrapper:HTMLElement) {

//   listWrapper.querySelectorAll("ul,button.submit-all-btn").forEach(el => el.remove());


//   const list = document.createElement("ul");

//   groceryItems.forEach((item, index) => {

//     const li = document.createElement("li");
//     li.textContent = `${item.quantity} ${item.unit || ""} - ${item.itemname} ${item.notes ? `(${item.notes})` : ""}`;

//     //delete button
//     const removeBtn = document.createElement("button");
//     removeBtn.textContent = "🗑️";
//     removeBtn.className = "action-btn remove-btn";
//     removeBtn.onclick = () => {
//       li.classList.add("fade-out");
//       setTimeout(() => {

//         groceryItems.splice(index, 1);
//         localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
//         renderList(listWrapper);
//       }, 300);

//     };

//     // ✏️ Edit button
//     const editBtn = document.createElement("button");
//     editBtn.textContent = "✏️";
//     editBtn.className = "action-btn edit-btn";
//     editBtn.onclick = () => {
//       li.classList.add("edit-blink");
//       setTimeout(() => li.classList.remove("edit-blink"), 300);

//       const updatedName = prompt("Edit item name:", item.itemname);
//       if (updatedName) {
//         groceryItems[index].itemname = updatedName;
//         localStorage.setItem("grocery-items", JSON.stringify(groceryItems));
//         renderList(listWrapper);
//       }
//     };
//     li.append(editBtn, removeBtn);
//     list.appendChild(li);

//   });
//   listWrapper.appendChild(list);

//   if (groceryItems.length > 0) {
//     // 🧾 Submit to DB button
//     const submitBtn = document.createElement("button");
//     submitBtn.textContent = "Add All to Database";
//     submitBtn.className = "submit-all-btn ";
//     submitBtn.onclick = async () => {
//       try {

//         await apiFetch("/grocery/add-grocery", {
//           method: "POST",
//           body: { items: groceryItems }
//         });

//         alert("Groceries added successfully!");
//         groceryItems.length = 0; // Clear items after success
//         localStorage.removeItem("grocery-items");
//         renderList(listWrapper); // Re-render clean state
//       } catch (err) {
//         console.error(err);
//         alert("Failed to submit groceries. Try again.");
//       }
//     };
//     listWrapper.appendChild(submitBtn);
//   }

// }