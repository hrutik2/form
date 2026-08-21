import { useEffect, useState } from "react";
import { fetchPublishedForm, submitPublishedForm } from "../../api/forms";
import { FormRenderer } from "../../components/forms/FormRenderer";
import { FormDocument } from "../../types/forms";

export const PublicFormPage = () => {
  const [form, setForm] = useState<FormDocument | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublishedForm()
      .then((publishedForm) => {
        setForm(publishedForm);
        setError("");
      })
      .catch((requestError: any) => {
        setForm(null);
        setError(requestError?.response?.data?.detail ?? "Unable to load published form.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="mx-auto max-w-4xl p-6 text-slate-500">Loading published form...</div>;
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-slate-500">
        {error || "No published form available."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <FormRenderer
        form={form}
        onSubmit={async (values) => {
          await submitPublishedForm(form._id!, values);
          setMessage("Form submitted successfully.");
        }}
      />
      {message ? <p className="mt-4 text-center text-teal-700">{message}</p> : null}
    </div>
  );
};
