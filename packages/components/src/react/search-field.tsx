import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { Search, ArrowRight } from "lucide-react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  form: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    minWidth: 0,
    height: 38,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 7,
    backgroundColor: colors.raised,
    color: colors.muted,
    outline: { default: "none", ":focus-within": `2px solid ${colors.ring}` },
    outlineOffset: 2,
  },
  label: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
  input: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    borderWidth: 0,
    padding: 0,
    height: 34,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.text,
    fontFamily: "inherit",
    fontSize: { default: 16, "@media(min-width:800px)": 13 },
  },
  submit: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 28,
    height: 28,
    borderWidth: 0,
    borderRadius: 4,
    padding: 0,
    backgroundColor: { default: "transparent", ":hover": colors.hover },
    color: colors.text,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
  },
  icon: { flexShrink: 0 },
});
export function SearchField({
  label,
  value,
  onValueChange,
  onSearch,
  placeholder = "Search…",
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
      {...stylex.props(styles.form)}
    >
      <label htmlFor={id} {...stylex.props(styles.label)}>
        {label}
      </label>
      <Search size={16} aria-hidden="true" {...stylex.props(styles.icon)} />
      <input
        id={id}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        {...stylex.props(styles.input)}
      />
      <button type="submit" aria-label="Search" {...stylex.props(styles.submit)}>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
