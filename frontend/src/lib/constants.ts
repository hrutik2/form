import { FormDocument } from "../types/forms";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const WIDTH_OPTIONS = [25, 33, 50, 66, 75, 100] as const;

export const DEFAULT_FORM: FormDocument = {
  name: "Untitled Form",
  slug: "untitled-form",
  description: "Dynamic form configuration",
  status: "draft",
  version: 1,
  header: {
    title: "Application Form",
    subtitle: "Complete the details below",
    description: "Fields marked required must be completed.",
    logo: null,
    alignment: "center"
  },
  sections: [
    {
      id: "section_1",
      title: "Personal Information",
      description: "",
      order: 1,
      rows: []
    }
  ]
};

export const PALETTE_FIELDS = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
  { type: "date", label: "Date" },
  { type: "textarea", label: "Textarea" },
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "file", label: "File Upload" },
  { type: "signature", label: "Signature" },
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" }
] as const;
