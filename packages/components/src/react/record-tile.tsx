import * as stylex from "@stylexjs/stylex";
import type { ReactNode, ComponentProps } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  tile: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    textDecoration: "none",
    color: colors.text,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.border, ":hover": colors.muted },
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surface,
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 3,
  },
  visual: { overflow: "hidden", backgroundColor: colors.raised },
  body: { padding: 16, display: "grid", gap: 7 },
  eyebrow: { fontSize: 11, color: colors.muted },
  title: { fontSize: 15, fontWeight: 600, margin: 0 },
  description: { fontSize: 12, color: colors.muted },
  footer: { marginTop: "auto", padding: 16, paddingTop: 0, fontSize: 11, color: colors.muted },
});
export function RecordTile({
  title,
  eyebrow,
  description,
  visual,
  footer,
  ...props
}: Omit<ComponentProps<"a">, "title" | "children"> & {
  title: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  visual?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <a {...props} {...stylex.props(styles.tile)}>
      {visual && <div {...stylex.props(styles.visual)}>{visual}</div>}
      <div {...stylex.props(styles.body)}>
        {eyebrow && <span {...stylex.props(styles.eyebrow)}>{eyebrow}</span>}
        <h3 {...stylex.props(styles.title)}>{title}</h3>
        {description && <div {...stylex.props(styles.description)}>{description}</div>}
      </div>
      {footer && <div {...stylex.props(styles.footer)}>{footer}</div>}
    </a>
  );
}
