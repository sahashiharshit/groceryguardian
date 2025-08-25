import { apiFetch } from "../../services/api.js";
import { showToast } from "../../services/toast.js";
import { setPageTitle } from "../app.js";

import { FormBuilder } from "../components/FormBuilder.js";
import { Modal, ModalInstance } from "../components/Modal.js";

interface UserInfo {
  user: any;
  id: string;
  name: string;
  email: string;
  mobileNo?: string;
  household?: string;
  createdAt: string;
}
function getStoredUser(): UserInfo | null {

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export async function render(): Promise<void> {

  const view = document.getElementById("view");
  if (!view) return;
  setPageTitle("Account Information")
  let user: UserInfo | null = getStoredUser();
  if (!user || !user.name || !user.email || !user.household) {
    try {
      const response = await apiFetch<{ user: UserInfo }>(`/users/getuser`, { method: "GET" });
      user = response.user;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      showToast("Failed to load account settings", "error");
      view.innerHTML = `<p>Unable to load account info. Please try again later.</p>`;
      return;
    }
  }

  view.innerHTML = `
    <div class="account-wrapper">
      <h2>Welcome, ${user.name}</h2>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Mobile:</strong> ${user.mobileNo || "-"}</p>
      <p><strong>Account Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
      <div class="account-actions">
        <button id="edit-profile-btn" class="account-btn">Edit Profile</button>
        <button id="change-password-btn" class="account-btn">Change Password</button>
        ${user.household ? `<button id="leave-group-btn" class="account-btn danger">Leave Group</button>` : ""}
        <button id="delete-account-btn" class="account-btn danger">Delete Account</button>
       
      </div>
    </div>
  `;
  let editmodal: ModalInstance;

  document.getElementById("edit-profile-btn")?.addEventListener("click", async () => {
    const modalForm = FormBuilder({
      id: "edit-profile-form",
      submitLabel: "Update",
      className: "edit-profile-container",
      fields: [
        { name: "name", label: "Full Name", required: true, defaultValue: user!.name },
        { name: "mobileNo", label: "Mobile Number", defaultValue: user!.mobileNo || "" },
      ],
      onSubmit: async (data) => {
        const updatedUser = await apiFetch<any>("/users/me", { method: "POST", body: data });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showToast("Profile updated!", "success");
        editmodal.closeModal();
        render();
      },

    });
    editmodal = Modal(modalForm, "custom-modal");
    editmodal.openModal();
  });
  let passwordModal: ModalInstance;
  document.getElementById("change-password-btn")?.addEventListener("click", async () => {
    const modalForm = FormBuilder({
      id: "change-password-form",
      submitLabel: "Change Password",
      className: "change-password-container",
      fields: [
        { name: "oldPassword", label: "Old Password", required: true, type: "password" },
        { name: "newPassword", label: "New Password", required: true, type: "password" },
        { name: "confirmPassword", label: "Confirm New Password", required: true, type: "password" },
      ],
      onSubmit: async (data) => {
        try {
          if (data.newPassword !== data.confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
          }
          console.log(data);
          await apiFetch("/auth/change-password", { method: "POST", body: data });
          showToast("Password changed successfully", "success");
          passwordModal.closeModal();
        } catch (error) {
          showToast("Failed to change password", "error");
          return;
        }

      },
    });
    passwordModal = Modal(modalForm, "custom-modal");
    passwordModal.openModal();
  });

  document.getElementById("leave-group-btn")?.addEventListener("click", async () => {
    const confirmation = confirm("Are you sure you want to leave the group?");
    if (!confirmation) {
      showToast("You did not leave the group.", "error");
      return;
    }
    try {
      await apiFetch(`/households/leave`, { method: "DELETE" });
      const updatedUser = { ...user!, household: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showToast("You left the group.", "success");
      render();
    } catch (error: any) {
      showToast(error.message || "Could not leave the group.", "error");
      return;
    }

  });

  document.getElementById("delete-account-btn")?.addEventListener("click", async () => {
    const confirmation = confirm("Are you sure you want to permanently delete your account?");
    if (confirmation) {
      await apiFetch(`/users/me`, { method: "DELETE" });
      localStorage.clear();
      showToast("Account deleted.", "success");
      location.reload();
    }
    showToast("Account deletion failed.", "error");
    return;
  });

}
