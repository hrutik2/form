import { ChangeEvent } from "react";
import { WIDTH_OPTIONS } from "../../lib/constants";
import { FormField } from "../../types/forms";

interface Props {
  field: FormField | null;
  onChange: (nextField: FormField) => void;
}

export const FieldSettings = ({ field, onChange }: Props) => {
  if (!field) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">Field Settings</h3>
        <p className="text-sm text-slate-500">Select a field to edit its configuration.</p>
      </div>
    );
  }

  const update = (key: keyof FormField, value: string | boolean | number) => {
    onChange({ ...field, [key]: value });
  };
  const usesOptions = field.type === "select" || field.type === "radio" || field.type === "multiselect";
  const options = field.options?.length ? field.options : [""];

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Field Settings</h3>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-500">Label</span>
          <input
            value={field.label}
            onChange={(event) => update("label", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-500">Name</span>
          <input
            value={field.name}
            onChange={(event) => update("name", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-500">Placeholder</span>
          <input
            value={field.placeholder ?? ""}
            onChange={(event) => update("placeholder", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-500">Width</span>
          <select
            value={field.width}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              update("width", Number(event.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          >
            {WIDTH_OPTIONS.map((width) => (
              <option key={width} value={width}>
                {width}%
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
          <span>Required</span>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => update("required", event.target.checked)}
          />
        </label>
        {usesOptions ? (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Options</span>
              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm"
                onClick={() => onChange({ ...field, options: [...options, `Option ${options.length + 1}`] })}
              >
                Add option
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(event) => {
                      const nextOptions = options.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item
                      );
                      onChange({ ...field, options: nextOptions });
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={options.length === 1}
                    onClick={() =>
                      onChange({
                        ...field,
                        options: options.filter((_, itemIndex) => itemIndex !== index)
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
