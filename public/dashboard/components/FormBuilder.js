

export function FormBuilder({ id = "form", fields = [], submitLabel = "Submit", onSubmit = () => {} }) {
  const formEl = document.createElement("form");
  formEl.id = id;
  formEl.className = "form-container";

  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";

    const label = document.createElement("label");
    label.htmlFor = field.name;
    label.textContent = field.label;

    let input;

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
          input.appendChild(option);
        });
        break;
      case "radio":
      case "checkbox":
        input = document.createElement("div");
        field.options?.forEach((opt) => {
          const inputOpt = document.createElement("input");
          inputOpt.type = field.type;
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
        input.type = field.type || "text";
    }

    if (field.type !== "checkbox" && field.type !== "radio") {
      input.name = field.name;
      input.id = field.name;
      input.value = field.defaultValue || "";
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.required) input.required = true;
      if (field.minLength) input.minLength = field.minLength;
      if (field.maxLength) input.maxLength = field.maxLength;
      if (field.className) input.className = field.className;
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
    const data = {};
    fields.forEach(field => {
      if (field.type === "checkbox") {
        data[field.name] = formData.getAll(field.name);
      } else {
        data[field.name] = formData.get(field.name);
      }
    });
    onSubmit(data);
  });

  return formEl;
}
