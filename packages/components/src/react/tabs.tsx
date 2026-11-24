import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  tabs: {
    display: "inline-flex",
    gap: 3,
    padding: 3,
    borderRadius: 8,
    backgroundColor: colors.raised,
    flexWrap: "wrap",
  },
  tab: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: 6,
    paddingBlock: 5,
    paddingInline: 10,
    color: colors.muted,
    fontFamily: "inherit",
    fontSize: 12,
    backgroundColor: "transparent",
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
  },
  selected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
    boxShadow: "0 1px 3px #0002",
  },
});
export function Tabs({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} {...stylex.props(styles.tabs)}>
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          id={id + "-" + item.value}
          aria-selected={item.value === value}
          tabIndex={item.value === value ? 0 : -1}
          onClick={() => onValueChange(item.value)}
          onKeyDown={(e) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? items.length - 1
                  : (index + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
            onValueChange(items[next]!.value);
            (e.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
          }}
          {...stylex.props(styles.tab, item.value === value && styles.selected)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
