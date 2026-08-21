import { useEffect, useState } from "react";
import { downloadSubmissionsXlsx, fetchForms, fetchSubmissions } from "../../api/forms";
import { formatIstDateTime } from "../../lib/date";
import { FormDocument, FormField, SubmissionRecord } from "../../types/forms";

const getFields = (form: FormDocument | undefined): FormField[] =>
  form?.sections.flatMap((section) => section.rows).flatMap((row) => row.fields) ?? [];

const getFieldKey = (field: FormField) => field.name || field.id;

const formatValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "-";
};

export const SubmissionsPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedForm = forms.find((form) => form._id === selectedFormId);
  const fields = getFields(selectedForm);

  const loadSubmissions = async (formId: string) => {
    setIsLoading(true);
    try {
      const records = await fetchSubmissions(formId);
      setSubmissions(records);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms()
      .then(async (items) => {
        setForms(items);
        const published = items.find((item) => item.status === "published") ?? items[0];
        if (published?._id) {
          setSelectedFormId(published._id);
          await loadSubmissions(published._id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setForms([]);
        setSubmissions([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">View submitted field values and export them.</p>
        </div>
        <button
          className="rounded-2xl bg-teal-700 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!selectedForm?._id || submissions.length === 0}
          onClick={() => {
            if (!selectedForm?._id) return;
            downloadSubmissionsXlsx(selectedForm._id, selectedForm.name);
          }}
        >
          Download XLSX
        </button>
      </div>

      <div className="mt-5">
        <label className="block max-w-md">
          <span className="mb-1 block text-sm text-slate-500">Form</span>
          <select
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={selectedFormId}
            onChange={(event) => {
              const nextFormId = event.target.value;
              setSelectedFormId(nextFormId);
              setSubmissions([]);
              if (nextFormId) {
                loadSubmissions(nextFormId);
              }
            }}
          >
            {forms.map((form) => (
              <option key={form._id} value={form._id}>
                {form.name} ({form.status})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Submitted At</th>
              {fields.map((field) => (
                <th key={field.id} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((submission) => (
              <tr key={submission._id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatIstDateTime(submission.submitted_at)}
                </td>
                {fields.map((field) => (
                  <td key={field.id} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatValue(submission.data[getFieldKey(field)])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && submissions.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No submissions found for this form.</p>
        ) : null}
        {isLoading ? <p className="p-5 text-sm text-slate-500">Loading submissions...</p> : null}
      </div>
    </div>
  );
};
