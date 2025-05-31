import { apiFetch } from "../api.js";
import { ErrorMessage } from "../components/ErrorMessage.js";
import { Title } from "../components/Title.js";
import { renderHTML } from "../utils/render.js";

export async function render() {
  renderHTML("#app",()=>`
  ${Title("Group List")}
  `);

  try {
    const data = await apiFetch("/api/users/getHouseholdInfo");
    if (!data.user.households) {
      return renderHTML("#app", () => Title("No Other Users"));
    }
    const members = data.user.households.map(
    user=> `<li>${user.name}</li>`
    ).join("");
    
    renderHTML("#app",()=>`
    ${Title("Household Members")}
    <ul>${members}</ul
    `);
    
  } catch (error) {
    renderHTML("#app", () => ErrorMessage("Failed to find users"));
  }
}
