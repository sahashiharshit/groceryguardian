export function GroceryList(items=[]){

const ul = document.createElement('ul');
ul.id="grocery-list";

items.forEach(item=>{

    const li = document.createElement("li");
    li.textContent = "hello";
    ul.appendChild(li);

});

return ul;

}