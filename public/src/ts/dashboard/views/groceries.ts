import { apiFetch } from "../../services/api.js";
import { GroceryHeader } from "../components/grocery/Header.js";
import { GroceryList } from "../components/grocery/List.js";
import { loadCSS } from "../utils/LoadCSS.js";
type GroceryItem = {

  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
}
type ApiGroceryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: string;
  notes?: string;
}
type GroceryApiResponse= {
  groceries: ApiGroceryItem[];
}
export async function render(): Promise<void> {


  try {
    const data = await apiFetch<GroceryApiResponse>("/api/grocery/grocery-list", { method: "GET" });
    const simplifiedList: GroceryItem[] = data.groceries.map((item) => ({
      id: item._id,
      name: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      notes: item.notes,
    }));
    const view = document.getElementById('view');
    if (!view) {
      console.warn('View container not found');
      return;
    }
    view.innerHTML = ''; // clear old content

    const header = GroceryHeader();
    const list = GroceryList(simplifiedList);

    view.appendChild(header);
    view.appendChild(list);
  } catch (error) {
    console.error('Failed to load groceries:', error);
    const view = document.getElementById('view');
    if (view) {
      view.innerHTML = '<p>Error loading groceries. Please try again later.</p>';
    }
  }

  loadCSS("../css/grocerypage.css");
}



