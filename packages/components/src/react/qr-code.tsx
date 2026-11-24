import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import QRCodeEncoder from "qrcode";
const styles = stylex.create({
  root: { display: "grid", gap: 10, justifyItems: "start" },
  canvas: { maxWidth: "100%", height: "auto", borderRadius: 6 },
});
export function QRCode({
  value,
  size = 200,
  label = "QR code",
}: {
  value: string;
  size?: number;
  label?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (canvas.current)
      QRCodeEncoder.toCanvas(
        canvas.current,
        value,
        { width: size, margin: 4, errorCorrectionLevel: "M" },
        (err) => {
          if (active) setError(err ? "Unable to encode this content." : "");
        },
      );
    return () => {
      active = false;
    };
  }, [value, size]);
  return (
    <div {...stylex.props(styles.root)}>
      <canvas ref={canvas} role="img" aria-label={label} {...stylex.props(styles.canvas)} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
