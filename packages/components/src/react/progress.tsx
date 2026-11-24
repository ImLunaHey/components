import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  root: { position: "relative", display: "grid", gap: 7 },
  heading: { display: "flex", justifyContent: "space-between", fontSize: 11, color: colors.muted },
  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.raised,
    overflow: "hidden",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 3,
  },
  fill: (percent: number) => ({
    height: "100%",
    width: `${percent}%`,
    backgroundColor: colors.accent,
    borderRadius: 4,
  }),
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.danger },
  tooltip: {
    position: "absolute",
    zIndex: 50,
    bottom: "100%",
    marginBottom: 6,
    left: 0,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    borderRadius: 6,
    paddingBlock: 6,
    paddingInline: 9,
    fontSize: 11,
    boxShadow: "0 3px 12px #0003",
  },
});
export function Progress({
  label,
  value,
  max = 100,
  detail,
  tone = "info",
}: {
  label: string;
  value: number;
  max?: number;
  detail?: string;
  tone?: "info" | "success" | "danger";
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const percent = Math.max(0, Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0));
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.heading)}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, value))}
        aria-describedby={show ? id : undefined}
        onPointerEnter={() => setShow(true)}
        onPointerLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setShow(false);
        }}
        {...stylex.props(styles.track)}
      >
        <div
          {...stylex.props(
            styles.fill(percent),
            tone === "success" && styles.success,
            tone === "danger" && styles.danger,
          )}
        />
      </div>
      {show && (
        <div id={id} role="tooltip" {...stylex.props(styles.tooltip)}>
          {label} · {percent}%{detail ? " · " + detail : ""}
        </div>
      )}
    </div>
  );
}
