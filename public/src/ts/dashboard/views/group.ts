import { apiFetch } from "../../services/api.js";
import { ErrorMessage } from "../components/ErrorMessage.js";
import { Title } from "../components/Title.js";
import { renderHTML } from "../utils/render.js";

export async function render() {
  renderHTML("#view",()=>`
  ${Title("Group List")}
  `);

  try {
    const data = await apiFetch("/api/users/getHouseholdInfo");
    if (!data.user.households) {
      return renderHTML("#view", () => Title("No Other Users"));
    }
    const members = data.user.households.map(
    user=> `<li>${user.name}</li>`
    ).join("");
    
    renderHTML("#view",()=>`
    ${Title("Household Members")}
    <ul>${members}</ul
    `);
    
  } catch (error) {
    renderHTML("#view", () => ErrorMessage("Failed to find users"));
  }
}
