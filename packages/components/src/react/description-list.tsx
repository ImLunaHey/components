import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  list: { margin: 0 },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(100px, 1fr) minmax(0, 1.5fr)",
    gap: 16,
    paddingBlock: 12,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    fontSize: 13,
  },
  label: { color: colors.muted },
  value: { margin: 0, overflowWrap: "anywhere" },
});
export function DescriptionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl {...stylex.props(styles.list)}>
      {items.map((item) => (
        <div key={item.label} {...stylex.props(styles.row)}>
          <dt {...stylex.props(styles.label)}>{item.label}</dt>
          <dd {...stylex.props(styles.value)}>{item.value ?? "Not recorded"}</dd>
        </div>
      ))}
    </dl>
  );
}
