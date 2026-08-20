import { useEffect, useState } from "react";
import { fetchForms } from "../../api/forms";
import { FormDocument } from "../../types/forms";

export const PublishedPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);

  useEffect(() => {
    fetchForms().then(setForms).catch(() => setForms([]));
  }, []);

  const published = forms.find((form) => form.status === "published");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Currently Published Form</h1>
        {published ? (
          <div className="mt-4 rounded-2xl bg-sand p-5">
            <p className="text-xl font-medium">{published.name}</p>
            <p className="mt-1 text-sm text-slate-500">{published.published_at}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No form is published.</p>
        )}
      </div>
    </div>
  );
};
