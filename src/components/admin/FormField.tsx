import { labelClass } from "./formStyles";

export default function FormField({
  label,
  htmlFor,
  children,
  full,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-grey-500">{hint}</p>}
    </div>
  );
}
