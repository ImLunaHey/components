import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  panel: {
    minWidth: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  title: { fontSize: 13, fontWeight: 600, margin: 0 },
  desc: { fontSize: 11, color: colors.muted, marginBlock: "3px 0" },
  body: { padding: 18, display: "grid", gap: 16 },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.border,
  },
});
export function Panel({
  title,
  description,
  actions,
  children,
  footer,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section {...stylex.props(styles.panel)}>
      {(title || actions) && (
        <header {...stylex.props(styles.head)}>
          <div>
            <h2 {...stylex.props(styles.title)}>{title}</h2>
            {description && <p {...stylex.props(styles.desc)}>{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div {...stylex.props(styles.body)}>{children}</div>
      {footer && <footer {...stylex.props(styles.footer)}>{footer}</footer>}
    </section>
  );
}
