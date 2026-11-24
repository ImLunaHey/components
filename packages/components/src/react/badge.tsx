import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    paddingBlock: 2,
    paddingInline: 6,
    borderRadius: 5,
    fontSize: 11,
    backgroundColor: colors.raised,
    color: colors.muted,
  },
  success: { color: colors.success },
  warning: { color: colors.warning },
  danger: { color: colors.danger },
  info: { color: colors.accent },
});
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  return (
    <span
      {...stylex.props(
        styles.base,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "danger" && styles.danger,
        tone === "info" && styles.info,
      )}
    >
      <span aria-hidden="true">•</span>
      {children}
    </span>
  );
}
