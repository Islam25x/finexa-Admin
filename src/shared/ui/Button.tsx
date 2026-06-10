import {
  Children,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import type { ButtonShape, ButtonSize, ButtonVariant } from "./types";
import { cn } from "./types";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-700",
  secondary: "bg-surface text-text-secondary border border-gray-300 hover:bg-gray-100",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

const CIRCLE_SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
};

function isIconOnlyChild(children: ReactNode) {
  const items = Children.toArray(children);
  if (items.length !== 1) return false;
  const child = items[0];
  if (!isValidElement(child)) return false;
  if (child.type === "svg") return true;
  if (typeof child.type === "function") {
    const props = child.props as { size?: number; strokeWidth?: number; children?: React.ReactNode };
    return (props?.size !== undefined || props?.strokeWidth !== undefined) && !props?.children;
  }
  return false;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    shape,
    loading = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const isIconOnly = isIconOnlyChild(children);
  const isCircle = shape === "circle" || (!shape && isIconOnly);

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition",
        VARIANT_STYLES[variant],
        isCircle ? CIRCLE_SIZE_STYLES[size] : SIZE_STYLES[size],
        isCircle ? "rounded-full aspect-square" : "rounded-md",
        isDisabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
      )}
      {children}
    </button>
  );
});

export default Button;
