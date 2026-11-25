import * as stylex from "@stylexjs/stylex";
import type { Printing } from "./data";
const styles = stylex.create({
  art: {
    aspectRatio: ".76",
    position: "relative",
    overflow: "hidden",
    padding: "10%",
    backgroundColor: "#262524",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    isolation: "isolate",
  },
  fire: { backgroundImage: "linear-gradient(150deg,#583728,#281e1b)" },
  water: { backgroundImage: "linear-gradient(150deg,#294a57,#19252b)" },
  grass: { backgroundImage: "linear-gradient(150deg,#3c4c35,#20271c)" },
  psychic: { backgroundImage: "linear-gradient(150deg,#4b3c58,#251f2c)" },
  lightning: { backgroundImage: "linear-gradient(150deg,#655328,#2b2519)" },
  orb: {
    position: "absolute",
    width: "80%",
    aspectRatio: "1",
    borderRadius: "50%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ffffff28",
    top: "20%",
    left: "10%",
    backgroundImage: "radial-gradient(circle at 30% 25%,#ffffff30,transparent 70%)",
    boxShadow: "inset -20px -15px 50px #0004",
    zIndex: -1,
  },
  orbInner: {
    position: "absolute",
    width: "55%",
    aspectRatio: "1",
    borderRadius: "50%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ffffff30",
    top: "31%",
    left: "22%",
    transform: "rotate(-30deg)",
    backgroundImage: "repeating-linear-gradient(45deg,transparent 0 8px,#ffffff08 8px 9px)",
  },
  top: {
    fontFamily: "ui-monospace,monospace",
    fontSize: 10,
    letterSpacing: 2,
    color: "#ffffffbd",
    display: "flex",
    justifyContent: "space-between",
  },
  name: {
    fontSize: "clamp(16px, 2vw, 29px)",
    fontWeight: 500,
    letterSpacing: "-.8px",
    lineHeight: 1.1,
  },
  bottom: { display: "grid", gap: 8 },
  sub: { fontSize: 9, letterSpacing: 1.4, color: "#ffffffc0", textTransform: "uppercase" },
  number: {
    fontSize: "clamp(42px, 5vw, 80px)",
    fontWeight: 300,
    letterSpacing: "-4px",
    color: "#ffffffc9",
    alignSelf: "center",
  },
});
export function CardArt({ card }: { card: Printing }) {
  return (
    <div
      aria-hidden="true"
      {...stylex.props(
        styles.art,
        card.element === "Fire" && styles.fire,
        card.element === "Water" && styles.water,
        card.element === "Grass" && styles.grass,
        card.element === "Psychic" && styles.psychic,
        card.element === "Lightning" && styles.lightning,
      )}
    >
      <div {...stylex.props(styles.top)}>
        <span>CL / ARCHIVE</span>
        <span>{card.element.slice(0, 3).toUpperCase()}</span>
      </div>
      <div {...stylex.props(styles.orb)} />
      <div {...stylex.props(styles.orbInner)} />
      <span {...stylex.props(styles.number)}>{card.number}</span>
      <div {...stylex.props(styles.bottom)}>
        <span {...stylex.props(styles.name)}>{card.name}</span>
        <span {...stylex.props(styles.sub)}>Abstract demo artwork</span>
      </div>
    </div>
  );
}
