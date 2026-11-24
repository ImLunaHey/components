import * as stylex from "@stylexjs/stylex";
import { useState, type ReactNode } from "react";
import { Menu, Sun, Moon, Box } from "lucide-react";
import { Button } from "./button";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  shell: {
    display: "grid",
    gridTemplateColumns: {
      default: "224px minmax(0,1fr)",
      "@media (max-width: 720px)": "minmax(0,1fr)",
    },
    minHeight: "100dvh",
    padding: 8,
    gap: 8,
  },
  sidebar: {
    display: { default: "flex", "@media (max-width: 720px)": "none" },
    flexDirection: "column",
    gap: 4,
    padding: 8,
  },
  visible: { display: "flex" },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 10,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 22,
  },
  nav: { display: "grid", gap: 3 },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    minHeight: 34,
    paddingBlock: 7,
    paddingInline: 10,
    borderRadius: 6,
    textDecoration: "none",
    color: colors.muted,
    backgroundColor: { default: "transparent", ":hover": colors.hover },
    fontSize: 12,
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
  },
  selected: { color: colors.text, backgroundColor: colors.raised },
  label: { paddingBlock: 8, paddingInline: 10, fontSize: 11, color: colors.muted },
  footer: { marginTop: "auto", padding: 10, color: colors.muted, fontSize: 11 },
  main: {
    minWidth: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 54,
    paddingInline: 24,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
  },
  crumb: { display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: colors.muted },
  body: { padding: { default: 28, "@media (max-width: 720px)": 16 }, display: "grid", gap: 22 },
  heading: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 25, fontWeight: 550, letterSpacing: "-.7px", margin: 0 },
  desc: { color: colors.muted, fontSize: 12, marginBlock: "5px 0" },
  mobile: { display: { default: "none", "@media (max-width: 720px)": "inline-flex" } },
});
export function AppShell({
  name,
  title,
  description,
  items,
  active,
  children,
  actions,
  mode,
  onModeChange,
}: {
  name: string;
  title: string;
  description?: string;
  items: { href: string; label: string; icon?: ReactNode }[];
  active: string;
  children: ReactNode;
  actions?: ReactNode;
  mode: "light" | "dark";
  onModeChange: (mode: "light" | "dark") => void;
}) {
  const [mobile, setMobile] = useState(false);
  return (
    <div {...stylex.props(styles.shell)}>
      <aside {...stylex.props(styles.sidebar, mobile && styles.visible)}>
        <div {...stylex.props(styles.brand)}>
          <Box size={18} />
          {name}
        </div>
        <div {...stylex.props(styles.label)}>Navigation</div>
        <nav aria-label={name + " navigation"} {...stylex.props(styles.nav)}>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              {...stylex.props(styles.link, active === item.href && styles.selected)}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
        <footer {...stylex.props(styles.footer)}>
          Luna’s projects
          <br />
          Personal account
        </footer>
      </aside>
      <main {...stylex.props(styles.main)}>
        <header {...stylex.props(styles.top)}>
          <div {...stylex.props(styles.crumb)}>
            <span {...stylex.props(styles.mobile)}>
              <Button aria-label="Toggle navigation" onClick={() => setMobile(!mobile)}>
                <Menu size={16} />
              </Button>
            </span>
            {name}
            <span>/</span>
            {title}
          </div>
          <Button size="small" onClick={() => onModeChange(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}{" "}
            {mode === "dark" ? "Light" : "Dark"} mode
          </Button>
        </header>
        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.heading)}>
            <div>
              <h1 {...stylex.props(styles.title)}>{title}</h1>
              {description && <p {...stylex.props(styles.desc)}>{description}</p>}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
