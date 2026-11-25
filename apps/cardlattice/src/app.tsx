import { useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Layers, Sun, Moon, Search } from "lucide-react";
import { Theme } from "@imlunahey/components/theme";
import { Button } from "@imlunahey/components/button";
import { palette } from "./tokens.stylex";
import { s } from "./styles";
const light = stylex.createTheme(palette, {
  canvas: "#f6f6f6",
  surface: "#ffffff",
  raised: "#eeeeee",
  text: "#202020",
  muted: "#656565",
  border: "#00000019",
  primary: "#202020",
  onPrimary: "#ffffff",
});
export function App() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [mode, setMode] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("luna-theme");
    return saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
  });
  return (
    <Theme mode={mode}>
      <div {...stylex.props(s.shell, mode === "light" && light)}>
        <a href="#main" {...stylex.props(s.skip)}>
          Skip to content
        </a>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerInner)}>
            <a href="/" {...stylex.props(s.brand)}>
              <Layers size={22} strokeWidth={1.5} /> cardlattice
              <span {...stylex.props(s.eyebrow)}> / demo</span>
            </a>
            <nav aria-label="Main navigation" {...stylex.props(s.nav)}>
              {[
                { href: "/pokemon/sets", label: "Catalogue" },
                { href: "/data", label: "Data" },
                { href: "/docs", label: "Docs" },
                { href: "/contribute", label: "Contribute" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={path === item.href ? "page" : undefined}
                  {...stylex.props(s.link, path === item.href && s.active)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div {...stylex.props(s.row)}>
              <a href="/search" aria-label="Search catalogue" {...stylex.props(s.link)}>
                <Search size={18} />
              </a>
              <Button
                aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => {
                  const next = mode === "dark" ? "light" : "dark";
                  setMode(next);
                  localStorage.setItem("luna-theme", next);
                }}
              >
                {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
            </div>
          </div>
        </header>
        <main id="main" {...stylex.props(s.container)}>
          <Outlet />
        </main>
        <footer {...stylex.props(s.footer)}>
          <span>Cardlattice · An open catalogue, carefully connected.</span>
          <div {...stylex.props(s.row)}>
            <a href="/coverage" {...stylex.props(s.link)}>
              Coverage
            </a>
            <a href="/review" {...stylex.props(s.link)}>
              Demo review queue
            </a>
            <a href="https://github.com/cardlattice/cardlattice" {...stylex.props(s.link)}>
              GitHub ↗
            </a>
          </div>
          <span>Design demo · sample metadata and abstract artwork placeholders.</span>
        </footer>
      </div>
    </Theme>
  );
}
