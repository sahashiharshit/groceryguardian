
interface FormFieldOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "radio" | "checkbox";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  options?: FormFieldOption[];
}
interface FormBuilderProps<T> {
  id?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit: (data: T) => void;

}

export function FormBuilder<T = any>({ id = "form", fields = [], submitLabel = "Submit", onSubmit = () => { } }: FormBuilderProps<T>): HTMLFormElement {
  const formEl = document.createElement("form");
  formEl.id = id;
  formEl.className = "form-container";

  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";

    const label = document.createElement("label");
    label.htmlFor = field.name;
    label.textContent = field.label;

    let input: HTMLElement;

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
        input = document.createElement("input");
        (input as HTMLInputElement).type = field.type || "text";
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

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = submitLabel;
  submitBtn.className = "form-submit";
  formEl.appendChild(submitBtn);

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
