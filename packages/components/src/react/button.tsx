import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 34,
    paddingBlock: 6,
    paddingInline: 11,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 6,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.45 },
    color: colors.text,
    backgroundColor: { default: colors.surface, ":hover": colors.raised },
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 3,
  },
  primary: {
    color: colors.onPrimary,
    backgroundColor: { default: colors.primary, ":hover": colors.primary },
    borderColor: colors.primary,
    filter: { default: "none", ":hover": "brightness(.92)" },
  },
  danger: { color: colors.danger },
  ghost: {
    backgroundColor: { default: "transparent", ":hover": colors.hover },
    borderColor: "transparent",
  },
  small: { minHeight: 28, paddingBlock: 3, paddingInline: 8, fontSize: 11 },
});
export function Button({
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "default" | "small";
}) {
  return (
    <button
      {...props}
      type={type}
      {...stylex.props(
        styles.base,
        variant === "primary" && styles.primary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        size === "small" && styles.small,
      )}
    />
  );
}
