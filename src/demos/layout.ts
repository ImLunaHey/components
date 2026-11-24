import * as stylex from "@stylexjs/stylex";
export const layout = stylex.create({
  stack: { display: "grid", gap: 16, minWidth: 0 },
  row: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  between: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2,minmax(0,1fr))",
      "@media (max-width: 800px)": "minmax(0,1fr)",
    },
    gap: 16,
  },
  three: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3,minmax(0,1fr))",
      "@media (max-width: 1000px)": "minmax(0,1fr)",
    },
    gap: 16,
  },
  muted: { opacity: 0.65, fontSize: 12 },
  metric: {
    fontSize: 28,
    fontWeight: 550,
    letterSpacing: "-.8px",
    fontVariantNumeric: "tabular-nums",
  },
  image: { width: "100%", height: 160, objectFit: "cover", borderRadius: 7 },
  note: {
    padding: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#8883",
    borderRadius: 7,
    fontSize: 12,
  },
  chart: { width: "100%", height: 100 },
  card: {
    display: "grid",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#8883",
    borderRadius: 8,
  },
  board: { display: "grid", alignContent: "start", gap: 12, minHeight: 320 },
  list: { margin: 0, padding: 0, listStyleType: "none", display: "grid", gap: 12 },
});
