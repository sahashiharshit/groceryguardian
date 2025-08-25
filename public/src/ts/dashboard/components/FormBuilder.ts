
interface FormFieldOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "radio" | "checkbox" | "password";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  options?: FormFieldOption[];
}
interface ExtraButton {
  label: string;
  onClick: (form: HTMLFormElement) => void;
  className?: string;

}

interface FormBuilderProps<T> {
  id?: string;
  fields: FormField[];
  submitLabel?: string;
  className: string;
  onSubmit: (data: T) => void;
  buttons?: ExtraButton[];
}

export function FormBuilder<T = any>({ id = "form", fields = [], submitLabel = "Submit", className, onSubmit = () => { }, buttons = [] }: FormBuilderProps<T>): HTMLFormElement {
  const formEl = document.createElement("form");
  formEl.id = id;
  formEl.className = className;

  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = `form-field ${field.className || ""}`;

    const label = document.createElement("label");
    label.htmlFor = field.name;
    label.textContent = field.label;

    let input: HTMLElement;
    let inputEl: HTMLInputElement | null = null;
    switch (field.type) {
      case "textarea":
        input = document.createElement("textarea");
        break;
      case "select":
        input = document.createElement("select");
        field.options?.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          (input as HTMLSelectElement).appendChild(option);
        });
        break;
      case "radio":
      case "checkbox":
        input = document.createElement("div");
        field.options?.forEach((opt) => {
          const inputOpt = document.createElement("input");
          inputOpt.type = field.type as "checkbox" | "radio";
          inputOpt.name = field.name;
          inputOpt.value = opt.value;
          inputOpt.id = `${field.name}-${opt.value}`;

          const lbl = document.createElement("label");
          lbl.htmlFor = inputOpt.id;
          lbl.textContent = opt.label;
          lbl.className = "inline-label";

          input.appendChild(inputOpt);
          input.appendChild(lbl);
        });
        break;
      default:
        const actualInput = document.createElement("input");
        const inputType = field.type === "password" ? "password" : field.type || "text";
        actualInput.type = inputType;
        inputEl = actualInput;

        actualInput.name = field.name;
        actualInput.id = field.name;
        if (field.defaultValue) actualInput.value = field.defaultValue;
        if (field.placeholder) actualInput.placeholder = field.placeholder;
        if (field.minLength !== undefined) actualInput.minLength = field.minLength;
        if (field.maxLength !== undefined) actualInput.maxLength = field.maxLength;
        if (field.required) actualInput.required = true;
        if (field.className) actualInput.className = field.className;
        if (field.type === "password") {
          const wrapperWithToggle = document.createElement("div");
          wrapperWithToggle.className = "password-wrapper";

          const toggleBtn = document.createElement("button");
          toggleBtn.type = "button";
          toggleBtn.textContent = "Show";
          toggleBtn.className = "toggle-password-btn";
          toggleBtn.onclick = (e) => {
            e.preventDefault();


            const isHidden = actualInput.type === "password";
            actualInput.type = isHidden ? "text" : "password";
            toggleBtn.textContent = isHidden ? "Hide" : "Show";
          };

          wrapperWithToggle.appendChild(actualInput);
          wrapperWithToggle.appendChild(toggleBtn);

          input = wrapperWithToggle; // Override input to be the wrapper div
        } else {
          input = actualInput;
        }
        break;
    }
    if (field.type !== "checkbox" && field.type !== "radio") {
      const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      inputEl.name = field.name;
      inputEl.id = field.name;
      if (field.defaultValue) (inputEl as any).value = field.defaultValue;
      if ("placeholder" in inputEl && field.placeholder) {
        inputEl.placeholder = field.placeholder;
      }

      if ("minLength" in inputEl && field.minLength !== undefined) {
        inputEl.minLength = field.minLength;
      }

      if ("maxLength" in inputEl && field.maxLength !== undefined) {
        inputEl.maxLength = field.maxLength;
      }
      if (field.required) inputEl.required = true;


      if (field.className) inputEl.className = field.className;

    }

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formEl.appendChild(wrapper);
  });



  if (buttons.length > 0) {
    const extrasWrapper = document.createElement("div");
    extrasWrapper.className = "form-extra-buttons";

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = btn.label;
      button.className = btn.className || "form-extra-button";
      button.onclick = () => btn.onClick(formEl);
      extrasWrapper.appendChild(button);
    });

    formEl.appendChild(extrasWrapper);
  }
  // Submit button (separate wrapper)
  const submitWrapper = document.createElement("div");
  submitWrapper.className = "form-submit-wrapper";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = submitLabel;
  submitBtn.className = "form-submit";

  submitWrapper.appendChild(submitBtn);
  formEl.appendChild(submitWrapper);

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formEl);
    const data: Record<string, any> = {};
    fields.forEach(field => {
      if (field.type === "checkbox") {
        data[field.name] = formData.getAll(field.name);
      } else {
        data[field.name] = formData.get(field.name);
      }
    });
    onSubmit(data as T);
  });

  return formEl;
}
