import { FormBuilder } from "../components/FormBuilder.js";
import { renderHTML } from "../utils/render.js";

export async function render() {
  const app = document.getElementById("app");
  app.innerHTML = ""; // clear old content
  
  const container = document.createElement("div");
  container.style.maxWidth = "600px";
  container.style.margin = "2rem auto";
  container.style.fontFamily = "Segoe UI, sans-serif";
  
  const heading = document.createElement("h2");
  heading.textContent = "Invite to Household";
  heading.style.textAlign = "center";
  heading.style.marginBottom = "1rem";
  
  const inputGroup = document.createElement("div");
  inputGroup.style.display = "flex";
  inputGroup.style.gap = "0.5rem";
  inputGroup.style.marginBottom = "1rem";

const resultsContainer = document.createElement("div");
  resultsContainer.id = "searchResults";
  
  const formItems = FormBuilder({
    id: "inviteForm",
    submitLabel: "Search",
    fields: [
      {
        name: "searchInput",
        label: "Find your partner",
        required: true,
        minLength: 3,
      },
    ],
    onSubmit: async(data) => {
     const query = data.searchInput.trim();
      resultsContainer.innerHTML = "<p>Searching...</p>";
      const users = await mockSearch(query);
      if (users.length === 0) {
        resultsContainer.innerHTML = "<p>No users found.</p>";
        return;
      }

      resultsContainer.innerHTML = ""; // Clear and rebuild

      users.forEach((user) => {
        const card = document.createElement("div");
        card.style.padding = "1rem";
        card.style.margin = "0.5rem 0";
        card.style.background = "#f5f5f5";
        card.style.borderRadius = "10px";
        card.style.display = "flex";
        card.style.justifyContent = "space-between";
        card.style.alignItems = "center";
        card.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";

        const info = document.createElement("div");
        info.innerHTML = `
          <strong>${user.name}</strong><br>
          ${user.email} | ${user.mobile}
        `;

        const inviteBtn = document.createElement("button");
        inviteBtn.textContent = "Invite";
        inviteBtn.style.background = "#28a745";
        inviteBtn.style.color = "#fff";
        inviteBtn.style.border = "none";
        inviteBtn.style.padding = "0.5rem 1rem";
        inviteBtn.style.borderRadius = "8px";
        inviteBtn.style.cursor = "pointer";

        inviteBtn.onclick = () => {
          alert(`Invitation sent to ${user.name}`);
          // TODO: hook into real invite API
        };

        card.appendChild(info);
        card.appendChild(inviteBtn);
        resultsContainer.appendChild(card);
     
    });
    },
  });
  inputGroup.appendChild(formItems);
  container.append(heading, inputGroup,resultsContainer);
  app.appendChild(container);
}

async function mockSearch(query) {
    
    await new Promise((r) => setTimeout(r, 500));

  const users = [
    { name: "Aditi Sharma", email: "aditi@example.com", mobile: "9876543210" },
    { name: "Ravi Mehta", email: "ravi@example.com", mobile: "9123456789" },
    { name: "Harshit Saxena", email: "harshit@example.com", mobile: "9999999999" },
  ];

  return users.filter(
    (u) => u.email.includes(query) || u.mobile.includes(query)
  );
}

