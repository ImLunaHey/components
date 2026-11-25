import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";

/** Adapt anchor props from router-independent components to TanStack navigation. */
export function renderRouterLink({ key, href, ...props }: ComponentProps<"a">) {
  return <Link key={key} to={href} {...props} />;
}
