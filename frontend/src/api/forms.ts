import { api } from "./client";
import {
  ApiFormResponse,
  FormDocument,
  PublishFormResponse,
  SubmissionRecord,
  SubmissionResponse,
  SubmissionTokenResponse
} from "../types/forms";

export const login = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (name: string, email: string, password: string) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};

export const fetchForms = async (): Promise<FormDocument[]> => {
  const { data } = await api.get("/forms");
  return data;
};

export const fetchForm = async (id: string): Promise<FormDocument> => {
  const { data } = await api.get<ApiFormResponse>(`/forms/${id}`);
  return data.form;
};

export const saveForm = async (payload: FormDocument) => {
  if (payload._id) {
    const { data } = await api.put<ApiFormResponse>(`/forms/${payload._id}`, payload);
    return data.form;
  }

  const { data } = await api.post<ApiFormResponse>("/forms", payload);
  return data.form;
};

export const publishForm = async (
  id: string,
  payload: { enable_expiry: boolean; expiry_value: number | null; expiry_unit: "minutes" | "hours" | "days" | "weeks" | null }
) => {
  const { data } = await api.post<PublishFormResponse>(`/forms/${id}/publish`, payload);
  return data;
};

export const deleteForm = async (id: string) => {
  const { data } = await api.delete(`/forms/${id}`);
  return data;
};

export const fetchPublishedForm = async (): Promise<FormDocument> => {
  const { data } = await api.get("/public/forms/published");
  return data;
};

export const submitPublishedForm = async (
  formId: string,
  values: Record<string, string | string[]>
) => {
  const tokenResponse = await api.get<SubmissionTokenResponse>(`/public/forms/${formId}/submission-token`);
  const { data } = await api.post<SubmissionResponse>(`/public/forms/${formId}/submissions`, values, {
    headers: {
      "X-Submission-Token": tokenResponse.data.submission_token
    }
  });
  return data;
};

export const fetchSubmissions = async (formId: string): Promise<SubmissionRecord[]> => {
  const { data } = await api.get(`/forms/${formId}/submissions`);
  return data;
};

export const downloadSubmissionsXlsx = async (formId: string, formName: string) => {
  const { data } = await api.get(`/forms/${formId}/submissions/export`, {
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${formName || "form"}_submissions.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
