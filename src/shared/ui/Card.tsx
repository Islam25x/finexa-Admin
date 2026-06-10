import type { ReactNode } from "react";
import type { CardPadding, CardVariant } from "./types";
import { cn } from "./types";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
};

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "box bg-surface",
  elevated: "box bg-surface shadow-md",
  outline: "bg-surface border border-border",
};

const PADDING_STYLES: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

function Card({
  children,
  variant = "default",
  padding = "md",
  className,
}: CardProps) {
  return (
    <div className={cn("rounded-xl", VARIANT_STYLES[variant], PADDING_STYLES[padding], className)}>
      {children}
    </div>
  );
}

export default Card;
