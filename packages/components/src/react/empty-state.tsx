import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  root: {
    padding: 40,
    display: "grid",
    justifyItems: "center",
    gap: 12,
    textAlign: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 10,
  },
  title: { margin: 0, fontSize: 18 },
  text: { margin: 0, maxWidth: 440, color: colors.muted, fontSize: 13 },
});
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section {...stylex.props(styles.root)}>
      <h2 {...stylex.props(styles.title)}>{title}</h2>
      <p {...stylex.props(styles.text)}>{description}</p>
      {action}
    </section>
  );
}
