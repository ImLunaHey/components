import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ImageOff } from "lucide-react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  frame: (ratio: string) => ({
    aspectRatio: ratio,
    width: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.raised,
  }),
  image: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  fallback: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    color: colors.muted,
    textAlign: "center",
    fontSize: 12,
  },
});
export function MediaImage({
  src,
  alt,
  aspectRatio = "4 / 3",
  loading = "lazy",
}: {
  src?: string;
  alt: string;
  aspectRatio?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState<string>();
  return (
    <div {...stylex.props(styles.frame(aspectRatio))}>
      {src && failed !== src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(src)}
          {...stylex.props(styles.image)}
        />
      ) : (
        <div
          role="img"
          aria-label={alt + " — image unavailable"}
          {...stylex.props(styles.fallback)}
        >
          <ImageOff size={24} aria-hidden="true" />
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}
