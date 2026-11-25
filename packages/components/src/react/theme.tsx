import "./reset.css";
import * as stylex from "@stylexjs/stylex";
import { useSyncExternalStore, type ReactNode } from "react";
import { colors } from "./tokens.stylex";
const light = stylex.createTheme(colors, {
  canvas: "#f6f6f6",
  surface: "#ffffff",
  raised: "#f0f0f0",
  border: "#00000019",
  text: "#202020",
  muted: "#656565",
  accent: "#2469ad",
  success: "#19754a",
  warning: "#8c5b10",
  danger: "#b52b35",
  primary: "#202020",
  onPrimary: "#ffffff",
  hover: "#00000006",
  ring: "#2469ad",
});
const styles = stylex.create({
  root: {
    color: colors.text,
    backgroundColor: colors.canvas,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: 13,
    lineHeight: 1.5,
    minHeight: "100dvh",
    colorScheme: "dark",
  },
  light: { colorScheme: "light" },
});
export function Theme({
  mode = "dark",
  children,
}: {
  mode?: "light" | "dark";
  children: ReactNode;
}) {
  return (
    <div
      data-theme={mode}
      {...stylex.props(styles.root, mode === "light" && light, mode === "light" && styles.light)}
    >
      {children}
    </div>
  );
}

const query = "(prefers-color-scheme: dark)";
function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
export function useSystemTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribeToSystemTheme,
    () => (window.matchMedia(query).matches ? "dark" : "light"),
    () => "light",
  );
}
