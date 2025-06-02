

export function GroceryList(items = []) {
  const listElement = document.createElement("ul");
  listElement.id = "grocery-list";

  items.forEach((item, index) => {
    const li = document.createElement("li");
  
    const itemInfo = document.createElement("div");
    itemInfo.className="item-info";
    itemInfo.innerHTML = `
      <strong>${item.name}</strong> - ${item.quantity} ${item.unit}
      <span style="color: ${item.status === "pending" ? "red" : "green"};">(${
      item.status
    })</span>
    `;

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "0.5rem";
    const purchasedBtn = document.createElement("button");
    purchasedBtn.className="purchase-btn"
    purchasedBtn.innerHTML="✅ Purchase";
   
    purchasedBtn.onclick = () => {
       if (item.status === "pending") {
      item.status = "purchased";
      itemInfo.querySelector("span").style.color = "green";
      itemInfo.querySelector("span").textContent = "(purchased)";
      itemInfo.classList.add("purchased");
    }
    };
    const deleteBtn = document.createElement("button");
    deleteBtn.className="delete-btn";
    deleteBtn.innerHTML = "🗑️ Delete";
   
    deleteBtn.onclick = () => {
      li.remove();
      // Optional: remove item from the items array too
      // items.splice(index, 1);
    };
    buttonGroup.appendChild(purchasedBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(itemInfo);
    li.appendChild(buttonGroup);
    listElement.appendChild(li);
  });

  return listElement;
}
