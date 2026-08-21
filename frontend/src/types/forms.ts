export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "datetime"
  | "password"
  | "checkbox"
  | "radio"
  | "select"
  | "multiselect"
  | "file"
  | "image"
  | "pdf"
  | "signature"
  | "heading"
  | "paragraph"
  | "divider"
  | "address";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  width: 25 | 33 | 50 | 66 | 75 | 100;
  order: number;
  options?: string[];
  defaultValue?: string;
}

export interface FormRow {
  id: string;
  fields: FormField[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  rows: FormRow[];
}

export interface FormHeader {
  title: string;
  subtitle?: string;
  description?: string;
  logo?: string | null;
  alignment: "left" | "center" | "right";
}

export interface FormDocument {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "unpublished";
  version: number;
  header: FormHeader;
  sections: FormSection[];
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  expires_at?: string | null;
  expiry_enabled?: boolean;
  created_by?: string | null;
  token_reuse_enabled?: boolean;
}

export interface ApiFormResponse {
  detail: string;
  form: FormDocument;
}

export interface PublishFormResponse {
  detail: string;
  form: FormDocument;
  recipient_links: RecipientLink[];
  public_link: string;
}

export interface SubmissionResponse {
  detail: string;
  submission: SubmissionRecord;
}

export interface SubmissionTokenResponse {
  detail: string;
  submission_token: string;
}

export interface RecipientLink {
  email: string;
  token: string;
  link: string;
  token_expiry?: string | null;
  token_status: "ACTIVE" | "USED";
}

export interface SubmissionRecord {
  _id: string;
  form_id: string;
  submitted_at: string;
  data: Record<string, string | string[]>;
}
