import { useEffect, useState } from "react";
import { fetchForms, fetchSubmissions } from "../../api/forms";
import { FormDocument, SubmissionRecord } from "../../types/forms";

export const SubmissionsPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  useEffect(() => {
    fetchForms()
      .then(async (items) => {
        setForms(items);
        const published = items.find((item) => item.status === "published") ?? items[0];
        if (published?._id) {
          const records = await fetchSubmissions(published._id);
          setSubmissions(records);
        }
      })
      .catch(() => {
        setForms([]);
        setSubmissions([]);
      });
  }, []);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">Submissions</h1>
      <div className="mt-5 space-y-3">
        {submissions.map((submission) => (
          <div key={submission._id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-3">
            <p className="font-medium">{submission._id}</p>
            <p>{forms.find((form) => form._id === submission.form_id)?.name ?? submission.form_id}</p>
            <p className="text-sm text-slate-500">{submission.submitted_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
