import * as stylex from "@stylexjs/stylex";
import { ImageOff } from "lucide-react";
import { palette } from "./tokens.stylex";
import type { Printing } from "./data";
const styles = stylex.create({
  placeholder: {
    aspectRatio: "600 / 825",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    textAlign: "center",
    backgroundColor: palette.surface,
    color: palette.muted,
  },
  number: { fontSize: 24, fontVariantNumeric: "tabular-nums" },
  label: { fontSize: 12, lineHeight: 1.5 },
});
export function CardArt({ card }: { card: Printing }) {
  return (
    <div {...stylex.props(styles.placeholder)}>
      <ImageOff size={24} aria-hidden="true" />
      <span {...stylex.props(styles.number)}>#{card.number}</span>
      <span {...stylex.props(styles.label)}>Artwork not published</span>
    </div>
  );
}
