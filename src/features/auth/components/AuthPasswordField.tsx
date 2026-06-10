import { Eye, EyeOff } from "lucide-react";
import { useState, type ChangeEvent } from "react";

type AuthPasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function AuthPasswordField({
  id,
  name,
  label,
  value,
  placeholder,
  disabled = false,
  error,
  autoComplete,
  onChange,
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={onChange}
          className={`w-full rounded-lg border bg-surface px-3 py-2 pr-11 text-sm text-text-secondary outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary/40 ${
            error ? "border-rose-500 focus:ring-rose-200" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed"
          aria-label={isVisible ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
