import { FormField, FormSection } from "../types/forms";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const createField = (
  type: FormField["type"],
  index: number
): FormField => ({
  id: `field_${crypto.randomUUID()}`,
  type,
  label: `${type[0].toUpperCase()}${type.slice(1)} Field`,
  name: `${type}_${index + 1}`,
  placeholder: "",
  description: "",
  required: false,
  width: 100,
  order: index + 1,
  options: type === "select" || type === "radio" ? ["Option 1", "Option 2"] : undefined
});

export const addFieldToSection = (
  sections: FormSection[],
  sectionId: string,
  field: FormField
) =>
  sections.map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    const nextRow = {
      id: `row_${crypto.randomUUID()}`,
      fields: [field]
    };

    return {
      ...section,
      rows: [...section.rows, nextRow]
    };
  });
