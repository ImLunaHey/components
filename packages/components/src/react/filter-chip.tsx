import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    minHeight: 32,
    paddingInline: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: { default: colors.raised, ":hover": colors.hover },
    color: colors.text,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 2,
  },
});
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      aria-label={"Remove filter: " + label}
      onClick={onRemove}
      {...stylex.props(styles.chip)}
    >
      {label}
      <X size={12} aria-hidden="true" />
    </button>
  );
}
