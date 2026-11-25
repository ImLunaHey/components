import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Search } from "lucide-react";
import { Input } from "@imlunahey/components/input";
import { Button } from "@imlunahey/components/button";
import { s } from "./styles";
const styles = stylex.create({ form: { alignItems: "end" } });
export function SearchForm() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        void navigate({ to: "/search", search: { q: value } });
      }}
      {...stylex.props(s.row, styles.form)}
    >
      <div {...stylex.props(s.grow)}>
        <Input
          label="Search the catalogue"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Card name, set, collector number…"
        />
      </div>
      <Button type="submit" variant="primary">
        <Search size={15} /> Search
      </Button>
    </form>
  );
}
