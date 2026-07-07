export type ContactFormFieldType = "text" | "email" | "tel" | "textarea";

export type ContactFormField = {
  id: string;
  /** Form `name` attribute — used when submitting leads. */
  name: string;
  label: string;
  placeholder: string;
  type: ContactFormFieldType;
  required: boolean;
};

/** Legacy LifeSpring / starter defaults — used when `formFields` is not saved. */
export const defaultContactFormFields: ContactFormField[] = [
  {
    id: "legacy-name",
    name: "name",
    label: "Name",
    placeholder: "Your name",
    type: "text",
    required: true,
  },
  {
    id: "legacy-businessName",
    name: "businessName",
    label: "Business Name",
    placeholder: "Your business name",
    type: "text",
    required: true,
  },
  {
    id: "legacy-email",
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    required: true,
  },
  {
    id: "legacy-phone",
    name: "phone",
    label: "Phone",
    placeholder: "(optional)",
    type: "tel",
    required: false,
  },
  {
    id: "legacy-message",
    name: "message",
    label: "Tell us where your business is today and where you'd like it to go.",
    placeholder: "",
    type: "textarea",
    required: true,
  },
];

function slugifyFieldName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "field";
}

function uniqueFieldName(base: string, existingNames: ReadonlySet<string>): string {
  if (!existingNames.has(base)) return base;

  let index = 2;
  while (existingNames.has(`${base}_${index}`)) {
    index += 1;
  }
  return `${base}_${index}`;
}

export function createContactFormFieldId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createContactFormField(
  partial: Partial<ContactFormField>,
  index: number,
  existingFields: readonly ContactFormField[],
): ContactFormField {
  const existingNames = new Set(existingFields.map((field) => field.name));
  const label = partial.label?.trim() || (partial.type === "textarea" ? "Message" : `Field ${index + 1}`);
  const baseName = partial.name?.trim() || slugifyFieldName(label);

  return {
    id: partial.id ?? createContactFormFieldId(),
    name: uniqueFieldName(baseName, existingNames),
    label,
    placeholder: partial.placeholder ?? "",
    type: partial.type ?? "text",
    required: partial.required ?? partial.type !== "tel",
  };
}

export function getContactFormFieldPillLabel(field: ContactFormField, index: number): string {
  const label = field.label.trim();
  return label || (field.type === "textarea" ? `Area ${index + 1}` : `Field ${index + 1}`);
}

export function addContactFormField(
  fields: readonly ContactFormField[],
  type: ContactFormFieldType = "text",
): ContactFormField[] {
  const nextField = createContactFormField({ type }, fields.length, fields);
  return [...fields, nextField];
}

export function updateContactFormField(
  fields: readonly ContactFormField[],
  fieldId: string,
  patch: Partial<ContactFormField>,
): ContactFormField[] {
  return fields.map((field) => {
    if (field.id !== fieldId) return field;

    const nextLabel = patch.label !== undefined ? patch.label : field.label;
    const otherNames = new Set(fields.filter((item) => item.id !== fieldId).map((item) => item.name));
    const nextName =
      patch.name !== undefined
        ? uniqueFieldName(patch.name.trim() || slugifyFieldName(nextLabel), otherNames)
        : field.name;

    return {
      ...field,
      ...patch,
      id: field.id,
      label: nextLabel,
      name: nextName,
      placeholder: patch.placeholder !== undefined ? patch.placeholder : field.placeholder,
    };
  });
}

export function deleteContactFormField(
  fields: readonly ContactFormField[],
  fieldId: string,
): ContactFormField[] {
  return fields.filter((field) => field.id !== fieldId);
}

export function reorderContactFormFields(
  fields: readonly ContactFormField[],
  fromIndex: number,
  toIndex: number,
): ContactFormField[] {
  if (fromIndex === toIndex) return [...fields];

  const next = [...fields];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function normalizeContactFormField(
  value: Partial<ContactFormField>,
  index: number,
  existingFields: readonly ContactFormField[],
): ContactFormField {
  const type: ContactFormFieldType =
    value.type === "email" || value.type === "tel" || value.type === "textarea" ? value.type : "text";

  return createContactFormField(
    {
      id: typeof value.id === "string" && value.id.trim() ? value.id : undefined,
      name: typeof value.name === "string" ? value.name : undefined,
      label: typeof value.label === "string" ? value.label : undefined,
      placeholder: typeof value.placeholder === "string" ? value.placeholder : "",
      type,
      required: typeof value.required === "boolean" ? value.required : type !== "tel",
    },
    index,
    existingFields,
  );
}

export function normalizeContactFormFields(value: unknown): ContactFormField[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized: ContactFormField[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") continue;
    normalized.push(normalizeContactFormField(item as Partial<ContactFormField>, index, normalized));
  }

  return normalized.length > 0 ? normalized : undefined;
}
