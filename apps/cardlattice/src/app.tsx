import { useCatalogue } from "./catalogue-provider";
import { number } from "./data";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Layers } from "lucide-react";
import { Theme, useSystemTheme } from "@imlunahey/components/theme";
import { SearchForm } from "./search-form";
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
  const { printings } = useCatalogue();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const mode = useSystemTheme();
  return (
    <Theme mode={mode}>
      <div {...stylex.props(s.shell, mode === "light" && light)}>
        <a href="#main" {...stylex.props(s.skip)}>
          Skip to content
        </a>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.headerInner)}>
            <Link to="/" {...stylex.props(s.brand)}>
              <Layers size={23} />
              cardlattice<span {...stylex.props(s.demo)}>DEMO</span>
            </Link>
            <div {...stylex.props(s.headerSearch)}>
              <SearchForm />
            </div>
          </div>
          <div {...stylex.props(s.navBar)}>
            <nav aria-label="Main navigation" {...stylex.props(s.nav)}>
              {[
                {
                  to: "/pokemon/cards",
                  label: "Cards",
                  active:
                    path === "/" ||
                    path === "/search" ||
                    path.includes("/cards") ||
                    path.includes("/printings"),
                },
                { to: "/pokemon/sets", label: "Sets", active: path.includes("/sets") },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={item.active ? "page" : undefined}
                  {...stylex.props(s.navLink, item.active && s.navActive)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <span {...stylex.props(s.muted)}>
              Pokémon TCG · {number(printings.length)} printings
            </span>
          </div>
        </header>
        <main id="main" {...stylex.props(s.container)}>
          <Outlet />
        </main>
        <footer {...stylex.props(s.footer)}>
          <span>Cardlattice · published catalogue</span>
          <div {...stylex.props(s.row)}>
            <Link to="/contribute" {...stylex.props(s.link)}>
              Contribute
            </Link>
            <Link to="/coverage" {...stylex.props(s.link)}>
              Coverage
            </Link>
            <Link to="/data" {...stylex.props(s.link)}>
              Data
            </Link>
            <Link to="/docs" {...stylex.props(s.link)}>
              Docs
            </Link>
            <Link to="/review" {...stylex.props(s.link)}>
              Demo review queue
            </Link>
          </div>
          <span>
            <a href="https://github.com/cardlattice/cardlattice-data" {...stylex.props(s.link)}>
              Cardlattice open metadata
            </a>{" "}
            · CC0 · No artwork in this snapshot
          </span>
        </footer>
      </div>
    </Theme>
  );
}
