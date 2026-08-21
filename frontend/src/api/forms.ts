import { api } from "./client";
import { FormDocument, SubmissionRecord } from "../types/forms";

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
  const { data } = await api.get(`/forms/${id}`);
  return data;
};

export const saveForm = async (payload: FormDocument) => {
  if (payload._id) {
    const { data } = await api.put(`/forms/${payload._id}`, payload);
    return data;
  }

  const { data } = await api.post("/forms", payload);
  return data;
};

export const publishForm = async (id: string) => {
  const { data } = await api.post(`/forms/${id}/publish`);
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
  const { data } = await api.post(`/public/forms/${formId}/submissions`, values);
  return data;
};

export const fetchSubmissions = async (formId: string): Promise<SubmissionRecord[]> => {
  const { data } = await api.get(`/forms/${formId}/submissions`);
  return data;
};
