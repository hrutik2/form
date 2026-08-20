import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchForms, publishForm } from "../../api/forms";
import { FormDocument } from "../../types/forms";

export const FormsListPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);

  const load = () => fetchForms().then(setForms).catch(() => setForms([]));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Forms</h1>
        <Link to="/builder/forms/create" className="rounded-2xl bg-teal-700 px-4 py-3 text-white">
          Create Form
        </Link>
      </div>
      <div className="space-y-3">
        {forms.map((form) => (
          <div key={form._id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
            <div>
              <p className="font-medium">{form.name}</p>
              <p className="text-sm text-slate-500">{form.slug}</p>
            </div>
            <p className="text-sm text-slate-500">{form.status}</p>
            <p className="text-sm text-slate-500">{form.updated_at ?? "-"}</p>
            <div className="flex gap-2">
              <Link to={`/builder/forms/${form._id}/edit`} className="rounded-xl border px-3 py-2">
                Edit
              </Link>
              <button
                className="rounded-xl bg-slate-900 px-3 py-2 text-white"
                onClick={async () => {
                  if (!form._id) return;
                  await publishForm(form._id);
                  load();
                }}
              >
                Publish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
