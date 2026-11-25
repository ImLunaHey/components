import { createContext, useContext, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as stylex from "@stylexjs/stylex";
import { Theme, useSystemTheme } from "@imlunahey/components/theme";
import { Panel } from "@imlunahey/components/panel";
import { Button } from "@imlunahey/components/button";
import { createCatalogue, type Catalogue } from "./data";
import { loadSnapshot } from "./snapshot";
const context = createContext<Catalogue | null>(null);
const client = new QueryClient();
const styles = stylex.create({
  loading: { maxWidth: 600, marginInline: "auto", paddingBlock: 80, paddingInline: 20 },
});
function Content({ children }: { children: ReactNode }) {
  const mode = useSystemTheme();
  const query = useQuery({
    queryKey: ["cardlattice-catalogue"],
    queryFn: async ({ signal }) => createCatalogue(await loadSnapshot(signal)),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  if (!query.data)
    return (
      <Theme mode={mode}>
        <main {...stylex.props(styles.loading)}>
          <Panel title={query.isError ? "Catalogue unavailable" : "Loading Cardlattice"}>
            <p role={query.isError ? "alert" : "status"}>
              {query.isError
                ? query.error.message
                : "Downloading and verifying the published catalogue…"}
            </p>
            {query.isError && <Button onClick={() => void query.refetch()}>Try again</Button>}
          </Panel>
        </main>
      </Theme>
    );
  return <context.Provider value={query.data}>{children}</context.Provider>;
}
export function CatalogueProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <Content>{children}</Content>
    </QueryClientProvider>
  );
}
export function useCatalogue() {
  const value = useContext(context);
  if (!value) throw Error("CatalogueProvider is required.");
  return value;
}
