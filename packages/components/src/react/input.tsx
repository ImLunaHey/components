import * as stylex from "@stylexjs/stylex";
import { useId, type ComponentProps } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  field: { display: "grid", gap: 6, fontSize: 12, minWidth: 0 },
  input: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    minHeight: 34,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 6,
    paddingBlock: 7,
    paddingInline: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: "inherit",
    fontSize: 12,
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 2,
    opacity: { default: 1, ":disabled": 0.5 },
  },
  error: { borderColor: colors.danger },
  hint: { fontSize: 11, color: colors.muted },
  message: { fontSize: 11, color: colors.danger },
});
export function Input({
  label,
  hint,
  error,
  id: provided,
  ...props
}: Omit<ComponentProps<"input">, "type"> & {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "search"
    | "url"
    | "tel"
    | "date"
    | "time"
    | "datetime-local";
  label: string;
  hint?: string;
  error?: string;
}) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <label htmlFor={id} {...stylex.props(styles.field)}>
      <span>{label}</span>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? id + "-hint" : props["aria-describedby"]}
        {...stylex.props(styles.input, !!error && styles.error)}
      />
      {(error || hint) && (
        <span id={id + "-hint"} {...stylex.props(error ? styles.message : styles.hint)}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
