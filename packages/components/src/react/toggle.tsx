import * as stylex from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 13,
    cursor: "pointer",
  },
  control: {
    appearance: "none",
    position: "relative",
    width: 32,
    height: 20,
    borderRadius: 12,
    backgroundColor: { default: colors.raised, ":checked": colors.accent },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 3,
  },
  knob: (checked: boolean) => ({
    position: "absolute",
    pointerEvents: "none",
    top: 4,
    left: checked ? 16 : 4,
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: colors.text,
  }),
  wrap: { position: "relative", height: 20 },
  input: { margin: 0 },
});
export function Toggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label {...stylex.props(styles.row)}>
      <span>{label}</span>
      <span {...stylex.props(styles.wrap)}>
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          {...stylex.props(styles.control, styles.input)}
        />
        <span {...stylex.props(styles.knob(checked))} />
      </span>
    </label>
  );
}
