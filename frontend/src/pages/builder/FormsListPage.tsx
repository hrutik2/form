import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteForm, fetchForms, publishForm } from "../../api/forms";
import { formatIstDateTime } from "../../lib/date";
import { FormDocument } from "../../types/forms";

const presetOptions = [
  { label: "24 Hours", value: 24, unit: "hours" as const },
  { label: "48 Hours", value: 48, unit: "hours" as const },
  { label: "72 Hours", value: 72, unit: "hours" as const }
];

export const FormsListPage = () => {
  const [forms, setForms] = useState<FormDocument[]>([]);
  const [publishTarget, setPublishTarget] = useState<FormDocument | null>(null);
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [expiryMode, setExpiryMode] = useState<"preset" | "custom">("preset");
  const [expiryValue, setExpiryValue] = useState("24");
  const [expiryUnit, setExpiryUnit] = useState<"minutes" | "hours" | "days" | "weeks">("hours");
  const [isPublishing, setIsPublishing] = useState(false);

  const load = () => fetchForms().then(setForms).catch(() => setForms([]));

  useEffect(() => {
    load();
  }, []);

  const resetPublishState = () => {
    setPublishTarget(null);
    setEnableExpiry(false);
    setExpiryMode("preset");
    setExpiryValue("24");
    setExpiryUnit("hours");
    setIsPublishing(false);
  };

  const openPublishModal = (form: FormDocument) => {
    setPublishTarget(form);
    setEnableExpiry(false);
    setExpiryMode("preset");
    setExpiryValue("24");
    setExpiryUnit("hours");
  };

  const handlePublish = async () => {
    if (!publishTarget?._id || isPublishing) return;

    let nextExpiryValue: number | null = null;
    let nextExpiryUnit: "minutes" | "hours" | "days" | "weeks" | null = null;

    if (enableExpiry) {
      nextExpiryValue = Number(expiryValue);
      nextExpiryUnit = expiryUnit;
      if (!Number.isFinite(nextExpiryValue) || nextExpiryValue <= 0) {
        return;
      }
    }

    setIsPublishing(true);
    try {
      await publishForm(publishTarget._id, {
        enable_expiry: enableExpiry,
        expiry_value: nextExpiryValue,
        expiry_unit: nextExpiryUnit
      });
      resetPublishState();
      await load();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Forms</h1>
          <Link to="/builder/forms/create" className="rounded-2xl bg-teal-700 px-4 py-3 text-white">
            Create Form
          </Link>
        </div>
        <div className="space-y-3">
          {forms.map((form) => {
            const isPublished = form.status === "published";

            return (
              <div key={form._id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-medium">{form.name}</p>
                  <p className="text-sm text-slate-500">{form.slug}</p>
                  {form.expires_at ? (
                    <p className="mt-1 text-xs text-amber-700">Expires: {formatIstDateTime(form.expires_at)}</p>
                  ) : null}
                </div>
                <p className="text-sm capitalize text-slate-500">{form.status}</p>
                <p className="text-sm text-slate-500">{formatIstDateTime(form.updated_at)}</p>
                <div className="flex flex-wrap gap-2">
                  {isPublished ? (
                    <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400">
                      Edit
                    </span>
                  ) : (
                    <Link to={`/builder/forms/${form._id}/edit`} className="rounded-xl border px-3 py-2 text-sm">
                      Edit
                    </Link>
                  )}
                  <button
                    className={`rounded-xl px-3 py-2 text-sm text-white ${
                      isPublished ? "cursor-not-allowed bg-slate-300" : "bg-slate-900"
                    }`}
                    disabled={isPublished}
                    onClick={() => {
                      if (isPublished) return;
                      openPublishModal(form);
                    }}
                  >
                    Publish
                  </button>
                  <button
                    className={`rounded-xl px-3 py-2 text-sm ${
                      isPublished
                        ? "cursor-not-allowed border border-slate-200 text-slate-400"
                        : "border border-red-200 text-red-700 hover:bg-red-50"
                    }`}
                    disabled={isPublished}
                    onClick={async () => {
                      if (!form._id || isPublished) return;
                      await deleteForm(form._id);
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {publishTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold">Publish form</h2>
            <p className="mt-2 text-sm text-slate-500">
              Do you want to publish <span className="font-medium text-slate-700">{publishTarget.name}</span> with expiry?
            </p>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">Enable expiry</p>
                <p className="text-sm text-slate-500">Turn this on to stop submissions after a selected time.</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableExpiry((current) => !current)}
                className={`relative h-7 w-14 rounded-full transition ${
                  enableExpiry ? "bg-teal-700" : "bg-slate-300"
                }`}
                aria-pressed={enableExpiry}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    enableExpiry ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>

            {enableExpiry ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpiryMode("preset");
                      setExpiryValue("24");
                      setExpiryUnit("hours");
                    }}
                    className={`rounded-xl px-4 py-2 text-sm ${
                      expiryMode === "preset" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700"
                    }`}
                  >
                    Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpiryMode("custom");
                      setExpiryValue("5");
                      setExpiryUnit("minutes");
                    }}
                    className={`rounded-xl px-4 py-2 text-sm ${
                      expiryMode === "custom" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {expiryMode === "preset" ? (
                  <div className="grid gap-2 md:grid-cols-3">
                    {presetOptions.map((option) => {
                      const active = expiryValue === String(option.value) && expiryUnit === option.unit;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => {
                            setExpiryValue(String(option.value));
                            setExpiryUnit(option.unit);
                          }}
                          className={`rounded-2xl border px-4 py-3 text-sm ${
                            active ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <input
                      type="number"
                      min="1"
                      value={expiryValue}
                      onChange={(event) => setExpiryValue(event.target.value)}
                      placeholder="Enter time like 5 or 3"
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    />
                    <select
                      value={expiryUnit}
                      onChange={(event) =>
                        setExpiryUnit(event.target.value as "minutes" | "hours" | "days" | "weeks")
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetPublishState}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing || (enableExpiry && (!Number.isFinite(Number(expiryValue)) || Number(expiryValue) <= 0))}
                onClick={handlePublish}
                className="rounded-2xl bg-teal-700 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
