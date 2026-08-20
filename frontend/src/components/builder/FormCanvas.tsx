import { GripVertical, Trash2 } from "lucide-react";
import { FormSection } from "../../types/forms";

interface Props {
  sections: FormSection[];
  onSelect: (sectionId: string, rowId: string, fieldId: string) => void;
  onDelete: (fieldId: string) => void;
}

export const FormCanvas = ({ sections, onSelect, onDelete }: Props) => (
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold">Form Canvas</h3>
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} className="rounded-3xl border border-dashed border-slate-300 p-4">
          <div className="mb-4">
            <h4 className="text-lg font-semibold">{section.title}</h4>
            <p className="text-sm text-slate-500">{section.description || "Editable section"}</p>
          </div>
          <div className="space-y-3">
            {section.rows.map((row) => (
              <div key={row.id} className="grid gap-3 md:grid-cols-2">
                {row.fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => onSelect(section.id, row.id, field.id)}
                    className="flex items-start justify-between rounded-2xl border border-slate-200 p-4 text-left hover:border-teal-700"
                  >
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <GripVertical size={16} />
                        <span className="text-xs uppercase tracking-wide">{field.type}</span>
                      </div>
                      <p className="font-medium">{field.label}</p>
                      <p className="text-sm text-slate-500">
                        {field.name} · {field.width}% width
                      </p>
                    </div>
                    <span
                      className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(field.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {section.rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Add fields from the left palette to start composing the form.
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  </div>
);
