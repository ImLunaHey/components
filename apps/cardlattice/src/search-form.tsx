import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Search } from "lucide-react";
import { Input } from "@imlunahey/components/input";
import { Button } from "@imlunahey/components/button";
const styles = stylex.create({
  form: { display: "flex", gap: 8, alignItems: "end", width: "100%" },
  field: { flex: 1, minWidth: 0 },
});
export function SearchForm() {
  const query = useRouterState({
    select: (state) => String((state.location.search as Record<string, unknown>).q ?? ""),
  });
  return <SearchField key={query} query={query} />;
}
function SearchField({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  const navigate = useNavigate();
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        void navigate({ to: "/search", search: { q: value.trim() } });
      }}
      {...stylex.props(styles.form)}
    >
      <div {...stylex.props(styles.field)}>
        <Input
          label="Search cards"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Name, number, set or illustrator…"
        />
      </div>
      <Button type="submit" variant="primary">
        <Search size={16} />
        <span>Search</span>
      </Button>
    </form>
  );
}
