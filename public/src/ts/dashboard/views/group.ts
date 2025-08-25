import { apiFetch } from "../../services/api.js";
import { showToast } from "../../services/toast.js";
import { setPageTitle } from "../app.js";
import { FormBuilder } from "../components/FormBuilder.js";
import { Modal } from "../components/Modal.js";

type Household = {
  _id: string;
  name: string;
  members: { userId: { _id: string; name: string; email: string }; role: string }[];
}
type SearchedUser = {
  _id: string;
  name: string;
  email: string;
  mobileNo?: string;
  householdId?: string | null;
};

export async function render(): Promise<void> {
  const view = document.getElementById("view");
  if (!view) return;

  setPageTitle("Group Management");
  const layout = document.createElement("div");
  layout.className = "group-layout";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.household) {
    view.innerHTML = "";
    const left = document.createElement("div");
    left.className = "group-left";
    const noGroupMessage = document.createElement("p");
    noGroupMessage.textContent = "You're not part of any group yet.";
    const createBtn = document.createElement("button");
    createBtn.className = "add-group-btn";
    createBtn.textContent = "Create Group";

    // Modal setup
    const form = FormBuilder({
      id: "create-group-form",
      submitLabel: "Create",
      className: "group-form-grid",
      fields: [
        {
          name: "name",
          label: "Group Name",
          required: true,
          minLength: 3,
        },
      ],
      onSubmit: async (data) => {
        try {
          const household = await apiFetch<Household>("/households/", {
            method: "POST",
            body: { name: data.name },
          });

          user.household = household._id;
          localStorage.setItem("user", JSON.stringify(user));
          showToast("Group created successfully!", "success");
          (groupModal as any).closeModal();
          render(); // re-render to show group info
        } catch (error) {
          showToast("Could not create group. Try again.", "error");

        }
      },
    });
    const groupModal = Modal(form, "group-modal");
    createBtn.onclick = () => (groupModal as any).openModal();

    left.appendChild(noGroupMessage);
    left.appendChild(createBtn);

    layout.appendChild(left);

    const right = document.createElement("div");
    right.className = "group-right";
    // ✅ Fetch pending invitations
    try {
      const invitations = await apiFetch<any[]>("/households/invitations/me");

      if (invitations.length > 0) {
        const inviteBox = document.createElement("div");
        inviteBox.className = "invitation-box";
        inviteBox.innerHTML = `<h3>You have pending group invitations:</h3>`;

        invitations.forEach((invitation) => {
          const card = document.createElement("div");
          card.className = "invitation-card";
          card.innerHTML = `
          <p><strong>Group:</strong> ${invitation.household.name}</p>
          <p><strong>Invited by:</strong> ${invitation.sender.name || "Someone"}</p>
        `;

          const acceptBtn = document.createElement("button");
          acceptBtn.textContent = "Accept";
          acceptBtn.className = "accept-btn";
          acceptBtn.onclick = async () => {
            try {
              await apiFetch(`/households/invitations/${invitation._id}/respond`, {
                method: "POST",
                body: { action: "accept" },
              });
              user.household = invitation.household;
              localStorage.setItem("user", JSON.stringify(user));
              inviteBox!.innerHTML = '';
              render();
              showToast("✅ You joined the group!", "success");

            } catch (e) {
              showToast("Failed to accept invite.", "error");
            }
          };

          const rejectBtn = document.createElement("button");
          rejectBtn.textContent = "Reject";
          rejectBtn.className = "reject-btn";
          rejectBtn.onclick = async () => {
            try {
              await apiFetch(`/households/invitations/${invitation._id}/respond`, {
                method: "POST",
                body: { action: "reject" },
              });
              showToast("❌ Invitation rejected.", "error");
              inviteBox!.innerHTML = '';
            } catch (e) {
              showToast("Failed to reject invite.", "error");
            }
          };

          card.appendChild(acceptBtn);
          card.appendChild(rejectBtn);
          inviteBox.appendChild(card);
          right.appendChild(inviteBox);
        });

        layout.appendChild(right);
      }
    } catch (err) {
      showToast("🔴 Failed to fetch invitations", "error");
    }



  } else {
    const household = await apiFetch<Household>(`/households/me`);

    const currentUserRole = household.members.find((m: any) => m.userId._id === user.id)?.role || "member";
    const isAdmin = currentUserRole === "owner";
    //---left section(Group Info panel)

    const left = document.createElement("div");
    left.className = "group-left";
    left.innerHTML = `
      <h2>Group: ${household.name}</h2>
      <p>Your role: ${currentUserRole}</p>
      <h3>Members:</h3>
      <ul>
        ${household.members
        .map((m: any) => {
          const isTargetMember = m.role === "member";
          const isNotSelf = m.userId._id !== user.id;
          const isCurrentUserOwner = m.role === "owner" && m.userId._id === user.id;
          return `<li data-user-id ="${m.userId._id}">
        ${m.userId.name} (${m.role})
        ${isAdmin && isTargetMember && isNotSelf ? `<button class="remove-member-btn" data-id="${m.userId._id}">Remove</button>
        <button class="make-owner-btn" data-id="${m.userId._id}">Make Owner</button>` :
              ``}
          ${isCurrentUserOwner ? `<button class="delete-group-btn" data-id="${household._id}">Delete Group</button>` : ""}
         </li>`;
        })
        .join("")}
      </ul>
    `;
    setTimeout(() => {
      const removeButtons = left.querySelectorAll(".remove-member-btn");
      removeButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const userId = btn.getAttribute("data-id");
          if (!userId) return;

          const confirmRemove = confirm("Are you sure you want to remove this member?");
          if (!confirmRemove) return;

          try {
            await apiFetch(`/households/${household._id}/members/${userId}`, {
              method: "DELETE",
            });
            showToast("Member removed successfully.", "success");
            render(); // Refresh the view
          } catch (err) {
            showToast("Failed to remove member.", "error");

          }

        });

      });

      const ownerButtons = left.querySelectorAll(".make-owner-btn");
      ownerButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const userId = btn.getAttribute("data-id");
          if (!userId) return;

          const confirmPromote = confirm("Are you sure you want to make this member an owner?");
          if (!confirmPromote) return;

          try {
            await apiFetch(`/households/${household._id}/members/${userId}`, {
              method: "PUT",
              body: { role: "owner" },
            });
            showToast("Member promoted to owner.", "success");
            render(); // refresh
          } catch {
            showToast("Failed to update member role.", "error");
          }
        });
      });

      const deleteButtons = left.querySelectorAll(".delete-group-btn");
      deleteButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const householdId = btn.getAttribute("data-id");
          if (!householdId) return;

          const confirmDelete = confirm("Are you sure you want to delete this group? This action cannot be undone!");
          if (!confirmDelete) return;

          try {
            await apiFetch(`/households/${householdId}`, {
              method: "DELETE",
            });
            showToast("Group deleted successfully.", "success");

            // Clear household info from user & re-render
            user.household = null;
            localStorage.setItem("user", JSON.stringify(user));
            render();
          } catch (err) {
            showToast("Failed to delete group.", "error");
          }
        });
      });
    }, 0);
    // ---Right Section (Invite Panel)
    const right = document.createElement("div");
    right.className = "group-right";
    if (isAdmin) {

      const inviteForm = FormBuilder({
        id: "invite-user-form",
        submitLabel: "Search",
        className: "form-container",
        fields: [
          {
            name: "identifier",
            label: "Email or Mobile Number",
            required: true,
          },
        ],
        onSubmit: async ({ identifier }) => {
          try {

            const foundUser = await apiFetch<SearchedUser>(`/households/search-user?identifier=${encodeURIComponent(identifier)}`);
            const recipientId = foundUser._id;
            const resultContainer = document.getElementById("search-result-container");
            resultContainer!.innerHTML = "";
            const result = document.createElement("div");
            result.id = "search-result";
            result.style.marginTop = "1rem";
            result.innerHTML = `
      <p><strong>${foundUser?.name}</strong><br>Email: ${foundUser?.email}<br>Mobile: ${foundUser?.mobileNo || "-"}</p>
    `;
            if (foundUser?.householdId) {
              result.innerHTML += `<p style="color:red;">User is already part of another group.</p>`;
            } else {
              const cancelBtn = document.createElement("button");
              cancelBtn.textContent = "Cancel";
              cancelBtn.className = "cancel-button"
              cancelBtn.onclick = async () => resultContainer!.innerHTML = "";
              const inviteBtn = document.createElement("button");
              inviteBtn.textContent = "Send Invite";
              inviteBtn.className = "send-invite";
              inviteBtn.onclick = async () => {
                try {
                  const res = await apiFetch<{ success?: boolean }>(`/households/${household._id}/invite`, {
                    method: "POST",
                    body: { recipientId },
                  });
                  // Assuming a successful invite returns a truthy 'success' property
                  if (res && res.success) {
                    resultContainer!.innerHTML = "";
                    (document.getElementById("invite-user-form") as HTMLFormElement).reset();
                    showToast("Invite sent successfully!", "success");
                  }
                } catch (err) {
                  showToast("Failed to send invite.", "error");

                }
              };
              const buttonGroup = document.createElement("div");
              buttonGroup.id = "search-result-buttons";
              buttonGroup.appendChild(inviteBtn);
              buttonGroup.appendChild(cancelBtn);
              result.appendChild(buttonGroup);
            }

            resultContainer!.appendChild(result);
          } catch (error: any) {
            if (error?.response?.status === 409) {
              showToast("User is already part of another group.", "error");
            } else {
              showToast("Failed to send invite.", "error");
            }

          }
        }
      });
      const inviteHeader = document.createElement("h3");
      inviteHeader.textContent = "Invite a Member";
      const resultContainer = document.createElement("div");
      resultContainer.id = "search-result-container";
      right.appendChild(inviteHeader);
      right.appendChild(inviteForm);
      right.appendChild(resultContainer);
    }
    layout.appendChild(left);
    if (isAdmin)
      layout.appendChild(right);
  }



  view.innerHTML = "";
  view.appendChild(layout);
}

