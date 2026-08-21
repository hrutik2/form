import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchForms } from "../../api/forms";
import { formatIstDateTime } from "../../lib/date";
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
            <p className="mt-1 text-sm text-slate-500">{formatIstDateTime(published.published_at)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white" to={`/form/${published._id}`}>
                View public form
              </Link>
              <Link className="rounded-xl border px-4 py-2 text-sm" to="/builder/forms">
                Back to forms
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500">No form is published.</p>
            <Link className="inline-flex rounded-xl border px-4 py-2 text-sm" to="/builder/forms">
              Publish a form
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
