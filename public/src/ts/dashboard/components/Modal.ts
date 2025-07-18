export type ModalInstance = {

  modal: HTMLDialogElement;
  openModal: () => void;
  closeModal: () => void;
};
export function Modal(content: HTMLElement, className = "custom-modal"): ModalInstance {
  const modal = document.createElement("dialog");
  modal.className = className;

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <span class="modal-close">&times;</span>
    </div>
  `;

  const contentContainer = modal.querySelector(".modal-content")!;
  contentContainer.appendChild(content);

  // Close logic
  const closeModal = () => {
    if (modal.open) modal.close();
  };

  modal.querySelector(".modal-overlay")?.addEventListener("click", closeModal);
  modal.querySelector(".modal-close")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Native showModal/close hooks
  const openModal = () => {
    if (!document.body.contains(modal)) {
      document.body.appendChild(modal);
    }
    if (!modal.open) modal.showModal();
  };


  return {modal,openModal,closeModal};
}
