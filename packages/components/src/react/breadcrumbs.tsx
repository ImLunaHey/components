import type { ComponentProps, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { ChevronRight } from "lucide-react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  list: {
    listStyleType: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    fontSize: 12,
    color: colors.muted,
  },
  item: { display: "flex", alignItems: "center", gap: 8 },
  link: {
    color: "inherit",
    textDecoration: { default: "none", ":hover": "underline" },
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
  },
});
export function Breadcrumbs({
  items,
  renderLink = (props) => <a {...props} />,
}: {
  items: { label: string; href?: string }[];
  renderLink?: (props: ComponentProps<"a">) => ReactNode;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol {...stylex.props(styles.list)}>
        {items.map((item, index) => (
          <li key={item.href ?? item.label} {...stylex.props(styles.item)}>
            {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {item.href ? (
              renderLink({ href: item.href, ...stylex.props(styles.link), children: item.label })
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
