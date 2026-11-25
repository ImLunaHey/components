import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { SearchField } from "@imlunahey/components/search-field";
export function SearchForm() {
  const query = useRouterState({
    select: (state) => String((state.location.search as Record<string, unknown>).q ?? ""),
  });
  return <CatalogueSearch key={query} query={query} />;
}
function CatalogueSearch({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  const navigate = useNavigate();
  return (
    <SearchField
      label="Search cards"
      value={value}
      onValueChange={setValue}
      onSearch={(q) => void navigate({ to: "/search", search: { q: q.trim() } })}
      placeholder="Search cards or sets…"
    />
  );
}
