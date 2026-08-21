import { useForm } from "react-hook-form";
import { FormDocument, FormField } from "../../types/forms";

interface Props {
  form: FormDocument;
  onSubmit: (data: Record<string, string | string[]>) => Promise<void>;
}

const FieldControl = ({ field, register }: { field: FormField; register: ReturnType<typeof useForm>["register"] }) => {
  const baseClass = "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3";
  const fieldName = field.name || field.id;

  if (field.type === "textarea") {
    return <textarea {...register(fieldName)} placeholder={field.placeholder} className={baseClass} />;
  }

  if (field.type === "select" || field.type === "radio") {
    return (
      <select {...register(fieldName)} className={baseClass}>
        <option value="">Select an option</option>
        {field.options?.filter(Boolean).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "multiselect") {
    return (
      <select {...register(fieldName)} multiple className={baseClass}>
        {field.options?.filter(Boolean).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "date" || field.type === "time" || field.type === "datetime") {
    const inputType = field.type === "datetime" ? "datetime-local" : field.type;

    return (
      <input
        {...register(fieldName)}
        type={inputType}
        placeholder={field.placeholder}
        className={baseClass}
      />
    );
  }

  return (
    <input
      {...register(fieldName)}
      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
      placeholder={field.placeholder}
      className={baseClass}
    />
  );
};

export const FormRenderer = ({ form, onSubmit }: Props) => {
  const { register, handleSubmit } = useForm<Record<string, string | string[]>>();
  const alignmentClass =
    form.header.alignment === "left"
      ? "text-left"
      : form.header.alignment === "right"
        ? "text-right"
        : "text-center";

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="rounded-[2rem] bg-white p-6 shadow-sm"
    >
      <header className={`mb-8 ${alignmentClass}`}>
        <h1 className="text-3xl font-semibold">{form.header.title}</h1>
        <p className="mt-2 text-lg text-slate-500">{form.header.subtitle}</p>
        <p className="mt-2 text-sm text-slate-500">{form.header.description}</p>
      </header>
      <div className="space-y-8">
        {form.sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {section.rows.flatMap((row) => row.fields).map((field) => (
                <label key={field.id} className="block">
                  <span className="text-sm font-medium text-slate-700">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  <FieldControl field={field} register={register} />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <button className="mt-8 rounded-2xl bg-teal-700 px-5 py-3 text-white">Submit</button>
    </form>
  );
};
