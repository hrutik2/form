import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchForm, saveForm } from "../../api/forms";
import { FieldPalette } from "../../components/builder/FieldPalette";
import { FieldSettings } from "../../components/builder/FieldSettings";
import { FormCanvas } from "../../components/builder/FormCanvas";
import { DEFAULT_FORM } from "../../lib/constants";
import { addFieldToSection, createField, slugify } from "../../lib/utils";
import { FormDocument, FormField } from "../../types/forms";

export const FormEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDocument>(DEFAULT_FORM);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchForm(id).then(setForm).catch(() => setForm(DEFAULT_FORM));
  }, [id]);

  const selectedField = useMemo(
    () =>
      form.sections
        .flatMap((section) => section.rows)
        .flatMap((row) => row.fields)
        .find((field) => field.id === selectedFieldId) ?? null,
    [form, selectedFieldId]
  );

  const updateField = (nextField: FormField) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          fields: row.fields.map((field) => (field.id === nextField.id ? nextField : field))
        }))
      }))
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
                slug: slugify(event.target.value)
              }))
            }
            placeholder="Form name"
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            value={form.description ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Description"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className={`rounded-2xl border px-4 py-3 ${
              isSaving ? "cursor-not-allowed opacity-60" : ""
            }`}
            disabled={isSaving}
            onClick={async () => {
              if (isSaving) return;
              setIsSaving(true);
              try {
                const saved = await saveForm(form);
                setForm(saved);
                navigate(`/builder/forms/${saved._id}/edit`, { replace: true });
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {form._id ? "Update Draft" : isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button className="rounded-2xl bg-teal-700 px-4 py-3 text-white">Preview</button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
        <FieldPalette
          onAdd={(type) =>
            setForm((current) => ({
              ...current,
              sections: addFieldToSection(
                current.sections,
                current.sections[0].id,
                createField(type, current.sections[0].rows.length)
              )
            }))
          }
        />
        <FormCanvas
          sections={form.sections}
          onSelect={(_, __, fieldId) => setSelectedFieldId(fieldId)}
          onDelete={(fieldId) =>
            setForm((current) => ({
              ...current,
              sections: current.sections.map((section) => ({
                ...section,
                rows: section.rows
                  .map((row) => ({
                    ...row,
                    fields: row.fields.filter((field) => field.id !== fieldId)
                  }))
                  .filter((row) => row.fields.length > 0)
              }))
            }))
          }
        />
        <FieldSettings field={selectedField} onChange={updateField} />
      </div>
    </div>
  );
};
