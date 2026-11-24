import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import type { ComponentType } from "react";
import "@imlunahey/components/styles.css";
export function mountDemo(App: ComponentType<{ view: string }>, defaultView: string) {
  const rootRoute = createRootRoute({ component: Outlet });
  const index = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <App view={defaultView} />,
  });
  const page = createRoute({
    getParentRoute: () => rootRoute,
    path: "/$view",
    component: () => {
      const { view } = page.useParams();
      return <App view={view} />;
    },
  });
  const router = createRouter({ routeTree: rootRoute.addChildren([index, page]) });
  createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
}
