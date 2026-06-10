import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import type { InputVariant } from "./types";
import { cn } from "./types";

type BaseProps = {
  variant?: InputVariant;
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  as?: "input" | "textarea";
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

const VARIANT_STYLES: Record<InputVariant, string> = {
  default:
    "bg-surface border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary/40",
  filled:
    "bg-gray-100 border border-border focus:bg-surface focus:border-primary-600 focus:ring-2 focus:ring-primary/40",
  outline:
    "bg-surface border border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary/40",
};

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  function Input(
    {
      variant = "default",
      label,
      error,
      containerClassName,
      inputClassName,
      as = "input",
      id,
      className,
      ...props
    },
    ref
  ) {
    const Component = as;
    const inputClasses = cn(
      "w-full rounded-lg px-3 py-2 text-sm text-text-secondary outline-none",
      VARIANT_STYLES[variant],
      error && "border-rose-500 focus:ring-rose-200",
      inputClassName,
      className
    );

    const field = (
      <Component
        id={id}
        ref={ref as never}
        className={inputClasses}
        {...props}
      />
    );

    if (!label && !error) {
      return field;
    }

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        {field}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

export default Input;
