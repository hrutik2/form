import { useEffect, useState } from "react";
import { fetchForms } from "../../api/forms";
import { FormDocument } from "../../types/forms";

export const DashboardPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);

  useEffect(() => {
    fetchForms().then(setForms).catch(() => setForms([]));
  }, []);

  const published = forms.find((item) => item.status === "published");
  const stats = [
    { label: "Total Forms", value: forms.length },
    { label: "Draft Forms", value: forms.filter((item) => item.status === "draft").length },
    { label: "Published Forms", value: forms.filter((item) => item.status === "published").length },
    { label: "Total Submissions", value: "Live" }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Recently created forms</h2>
          <div className="mt-4 space-y-3">
            {forms.slice(0, 5).map((form) => (
              <div key={form._id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium">{form.name}</p>
                <p className="text-sm text-slate-500">{form.status}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Current published form</h2>
          {published ? (
            <div className="mt-4 rounded-2xl bg-sand p-4">
              <p className="font-medium">{published.name}</p>
              <p className="text-sm text-slate-500">{published.published_at ?? "Pending timestamp"}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No form is currently published.</p>
          )}
        </div>
      </section>
    </div>
  );
};
