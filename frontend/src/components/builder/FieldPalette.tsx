import { Plus } from "lucide-react";
import { PALETTE_FIELDS } from "../../lib/constants";
import { FormField } from "../../types/forms";

interface Props {
  onAdd: (type: FormField["type"]) => void;
}

export const FieldPalette = ({ onAdd }: Props) => (
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold">Field Palette</h3>
    <div className="grid gap-3">
      {PALETTE_FIELDS.map((field) => (
        <button
          key={field.type}
          onClick={() => onAdd(field.type)}
          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left hover:border-teal-600 hover:bg-teal-50"
        >
          <span>{field.label}</span>
          <Plus size={16} />
        </button>
      ))}
    </div>
  </div>
);
