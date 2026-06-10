import { createElement } from "react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { TextVariant, TextWeight } from "./types";
import { cn } from "./types";

type TextProps<T extends ElementType> = {
  as?: T;
  variant?: TextVariant;
  weight?: TextWeight;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

const VARIANT_STYLES: Record<TextVariant, string> = {
  title: "text-2xl",
  subtitle: "text-lg",
  body: "text-sm",
  caption: "text-xs",
};

const WEIGHT_STYLES: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  weight = "normal",
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return createElement(
    Component,
    {
      className: cn(VARIANT_STYLES[variant], WEIGHT_STYLES[weight], className),
      ...props,
    } as ComponentPropsWithoutRef<T>,
    children,
  );
}

export default Text;
