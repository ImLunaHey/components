import * as stylex from "@stylexjs/stylex";
import { ImageOff } from "lucide-react";
import { MediaImage } from "@imlunahey/components/media-image";
import { palette } from "./tokens.stylex";
import { useArtwork } from "./use-artwork";
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
export function CardArt({ card, detail = false }: { card: Printing; detail?: boolean }) {
  const { artwork, pending, failed } = useArtwork(card);
  return artwork ? (
    <MediaImage
      src={`${artwork.image}/${detail ? "high" : "low"}.webp`}
      alt={`${card.name} · ${card.number} · ${card.language} card artwork`}
      aspectRatio="600 / 825"
      loading={detail ? "eager" : "lazy"}
    />
  ) : (
    <div {...stylex.props(styles.placeholder)} aria-busy={pending}>
      <ImageOff size={24} aria-hidden="true" />
      <span {...stylex.props(styles.number)}>#{card.number}</span>
      <span {...stylex.props(styles.label)}>
        {pending
          ? "Finding artwork…"
          : failed
            ? "Artwork temporarily unavailable"
            : "No matching artwork"}
      </span>
    </div>
  );
}
