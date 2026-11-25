import { createRoot } from "react-dom/client";
import { createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import "@imlunahey/components/styles.css";
import { EmptyState } from "@imlunahey/components/empty-state";
import { App } from "./app";
import { Home } from "./home";
import { Catalogue } from "./catalogue";
import { Record } from "./record";
import { Information } from "./information";
const root = createRootRoute({
  component: App,
  notFoundComponent: () => (
    <EmptyState
      title="Page not found"
      description="This address is not part of the demo catalogue."
      action={<a href="/">Return to the catalogue</a>}
    />
  ),
});
const home = createRoute({ getParentRoute: () => root, path: "/", component: Home });
const browse = ["/pokemon", "/pokemon/sets", "/pokemon/sets/$id", "/pokemon/cards", "/search"].map(
  (path) =>
    createRoute({
      getParentRoute: () => root,
      path,
      validateSearch: (search: Record<string, unknown>) => ({
        q: typeof search.q === "string" ? search.q : "",
        language: typeof search.language === "string" ? search.language : "",
        rarity: typeof search.rarity === "string" ? search.rarity : "",
        view: search.view === "table" ? "table" : "grid",
        sort: search.sort === "name" ? "name" : "number",
        page: Math.max(1, Number.isSafeInteger(Number(search.page)) ? Number(search.page) : 1),
      }),
      component: Catalogue,
    }),
);
const records = ["/pokemon/printings/$id", "/pokemon/cards/$id"].map((path) =>
  createRoute({ getParentRoute: () => root, path, component: Record }),
);
const info = ["data", "docs", "coverage", "contribute", "review"].map((page) =>
  createRoute({
    getParentRoute: () => root,
    path: "/" + page,
    component: () => <Information page={page} />,
  }),
);
const router = createRouter({
  routeTree: root.addChildren([home, ...browse, ...records, ...info]),
  scrollRestoration: true,
});
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
