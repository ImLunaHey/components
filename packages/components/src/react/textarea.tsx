import * as stylex from "@stylexjs/stylex";
import { useId, type ComponentProps } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  field: { display: "grid", gap: 6, fontSize: 12 },
  input: {
    boxSizing: "border-box",
    width: "100%",
    minHeight: 90,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: "inherit",
    fontSize: 13,
    resize: "vertical",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 2,
  },
});
export function Textarea({
  label,
  id: provided,
  ...props
}: ComponentProps<"textarea"> & { label: string }) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <label htmlFor={id} {...stylex.props(styles.field)}>
      <span>{label}</span>
      <textarea {...props} id={id} {...stylex.props(styles.input)} />
    </label>
  );
}
