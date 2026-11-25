import * as stylex from "@stylexjs/stylex";
import { useState, useRef, useEffect, useId, type ReactNode, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { colors } from "./tokens.stylex";
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  keywords?: string;
}
export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  searchable?: boolean;
  /** Bound rendered search results for large datasets; refine the query to reach more. */
  maxVisibleOptions?: number;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
}
const styles = stylex.create({
  field: { position: "relative", display: "grid", gap: 6, minWidth: 160, fontSize: 12 },
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    width: "100%",
    minHeight: 34,
    paddingBlock: 7,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
    color: colors.text,
    font: "inherit",
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
    outlineOffset: 2,
    opacity: { default: 1, ":disabled": 0.45 },
  },
  content: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  popup: {
    position: "absolute",
    top: "100%",
    marginTop: 5,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 8,
    padding: 5,
    boxShadow: "0 12px 36px #0005",
  },
  search: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: 7,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  searchInput: {
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.text,
    width: "100%",
    font: "inherit",
  },
  list: { maxHeight: 240, overflowY: "auto", padding: 0, margin: 0, listStyleType: "none" },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 5,
    cursor: "pointer",
    outline: "none",
  },
  active: { backgroundColor: colors.raised },
  disabled: { opacity: 0.4, cursor: "not-allowed" },
  copy: { flex: 1 },
  description: { display: "block", color: colors.muted, fontSize: 11 },
  empty: { padding: 12, color: colors.muted },
});
export function Select({
  label,
  options,
  value,
  onValueChange,
  searchable = false,
  maxVisibleOptions,
  disabled = false,
  name,
  placeholder = "Select…",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);
  const matches = options.filter((o) =>
    (o.label + " " + (o.keywords ?? "")).toLowerCase().includes(query.toLowerCase()),
  );
  const filtered =
    maxVisibleOptions && searchable ? matches.slice(0, Math.max(1, maxVisibleOptions)) : matches;
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    if (searchable) search.current?.focus();
    return () => document.removeEventListener("pointerdown", close);
  }, [open, searchable]);
  useEffect(() => {
    if (open) document.getElementById(id + "-" + active)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active, id]);
  function initialIndex() {
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    return selectedIndex >= 0 && (!maxVisibleOptions || selectedIndex < maxVisibleOptions)
      ? selectedIndex
      : Math.max(
          0,
          options.findIndex((option) => !option.disabled),
        );
  }
  function choose(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
    setQuery("");
    trigger.current?.focus();
  }
  function keys(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      trigger.current?.focus();
      event.preventDefault();
    } else if (event.key === "Tab") setOpen(false);
    else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setQuery("");
        setActive(initialIndex());
        return;
      }
      if (!filtered.length) return;
      const direction = event.key === "ArrowUp" || event.key === "End" ? -1 : 1;
      let next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? filtered.length - 1
            : (active + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
      for (let n = 0; n < filtered.length && filtered[next]?.disabled; n++)
        next = (next + direction + filtered.length) % filtered.length;
      setActive(next);
    } else if (open && event.key === "Enter") {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    }
  }
  return (
    <div ref={root} {...stylex.props(styles.field)}>
      <span id={id + "-label"}>{label}</span>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={trigger}
        onKeyDown={keys}
        type="button"
        role="combobox"
        aria-labelledby={id + "-label"}
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={open && filtered[active] ? id + "-" + active : undefined}
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setQuery("");
          setActive(0);
        }}
        {...stylex.props(styles.trigger)}
      >
        <span {...stylex.props(styles.content)}>
          {selected?.icon}
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div {...stylex.props(styles.popup)}>
          {searchable && (
            <div {...stylex.props(styles.search)}>
              <Search size={14} />
              <input
                ref={search}
                onKeyDown={keys}
                role="combobox"
                aria-expanded={true}
                aria-controls={id}
                aria-autocomplete="list"
                aria-activedescendant={filtered[active] ? id + "-" + active : undefined}
                aria-label={"Search " + label}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                {...stylex.props(styles.searchInput)}
              />
            </div>
          )}
          <ul id={id} role="listbox" aria-labelledby={id + "-label"} {...stylex.props(styles.list)}>
            {filtered.map((option, index) => (
              <li
                key={option.value}
                id={id + "-" + index}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(option)}
                {...stylex.props(
                  styles.option,
                  active === index && styles.active,
                  option.disabled && styles.disabled,
                )}
              >
                {option.icon}
                <span {...stylex.props(styles.copy)}>
                  {option.label}
                  {option.description && (
                    <small {...stylex.props(styles.description)}>{option.description}</small>
                  )}
                </span>
                {value === option.value && <Check size={14} />}
              </li>
            ))}
          </ul>
          {filtered.length < matches.length && (
            <div role="status" {...stylex.props(styles.empty)}>
              Showing {filtered.length} of {matches.length}. Type to narrow results.
            </div>
          )}
          {!filtered.length && (
            <div role="status" {...stylex.props(styles.empty)}>
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}
