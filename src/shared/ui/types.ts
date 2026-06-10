export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "default" | "circle";

export type CardVariant = "default" | "elevated" | "outline";
export type CardPadding = "sm" | "md" | "lg";

export type InputVariant = "default" | "filled" | "outline";

export type TextVariant = "title" | "subtitle" | "body" | "caption";
export type TextWeight = "normal" | "medium" | "bold";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
