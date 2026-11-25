import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@imlunahey/components/input";
import { Select } from "@imlunahey/components/select";
import { LanguageSelect } from "@imlunahey/components/language-select";
import { Button } from "@imlunahey/components/button";
import { Breadcrumbs } from "@imlunahey/components/breadcrumbs";
import { FilterChip } from "@imlunahey/components/filter-chip";
import { Pagination } from "@imlunahey/components/pagination";
import { EmptyState } from "@imlunahey/components/empty-state";
import { DataTable } from "@imlunahey/components/data-table";
import { RecordLink } from "../../../src/demos/record-link";
import { renderRouterLink } from "../../../src/demos/router-link";
import { sets, printings, filterPrintings, setName, type Printing } from "./data";
import { PrintingTile } from "./printing-tile";
import { s } from "./styles";
export function Catalogue() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useRouterState({ select: (state) => state.location });
  const navigate = useNavigate();
  const search = location.search as Record<string, unknown>;
  const value = (key: string) => (typeof search[key] === "string" ? (search[key] as string) : "");
  const q = value("q"),
    language = value("language"),
    rarity = value("rarity"),
    type = value("type"),
    selectedSet = value("set");
  const view = search.view === "table" ? "table" : "grid";
  const setId = location.pathname.startsWith("/pokemon/sets/")
    ? location.pathname.split("/")[3]
    : undefined;
  const set = sets.find((item) => item.id === setId);
  const isSets = ["/pokemon", "/pokemon/sets"].includes(location.pathname);
  const matches = filterPrintings(search, setId);
  const pageSize = 12;
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(matches.length / pageSize) || 1,
      Number.isSafeInteger(Number(search.page)) ? Number(search.page) : 1,
    ),
  );
  const shown = matches.slice((page - 1) * pageSize, page * pageSize);
  function update(patch: Record<string, string | number>) {
    void navigate({
      to: location.pathname,
      search: { ...search, ...patch, page: patch.page ?? 1 },
      replace: true,
      resetScroll: false,
    });
  }
  function clear() {
    update({ q: "", set: "", language: "", rarity: "", type: "" });
  }
  const columns = useMemo(
    () => [
      { accessorKey: "number", header: "No." },
      {
        accessorKey: "name",
        header: "Card",
        cell: ({ row }: { row: { original: Printing } }) => (
          <Link
            to={"/pokemon/printings/" + row.original.id}
            search={{ origin: location.pathname, browse: search }}
            {...stylex.props(s.link, s.active)}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "setId",
        header: "Set",
        cell: ({ getValue }: { getValue: () => unknown }) => setName(String(getValue())),
      },
      {
        accessorKey: "language",
        header: "Language",
        cell: ({ getValue }: { getValue: () => unknown }) =>
          getValue() === "fr" ? "French" : "English",
      },
      { accessorKey: "rarity", header: "Rarity" },
      { accessorKey: "element", header: "Type" },
      {
        accessorKey: "artist",
        header: "Illustrator",
        cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() ?? "Not recorded"),
      },
    ],
    [location.pathname, search],
  );
  if (setId && !set)
    return (
      <EmptyState
        title="Set not found"
        description="This set is not in the demo."
        action={
          <Link to="/pokemon/sets" {...stylex.props(s.cta)}>
            Browse sets
          </Link>
        }
      />
    );
  if (isSets) {
    const shownSets = sets.filter((item) =>
      (item.name + " " + item.year).toLowerCase().includes(q.toLowerCase()),
    );
    return (
      <>
        <div {...stylex.props(s.between)}>
          <div {...stylex.props(s.stack)}>
            <h1 {...stylex.props(s.title)}>Pokémon sets</h1>
            <p {...stylex.props(s.muted)}>
              Choose a set to see its cards. Three original-series sets are included in this demo.
            </p>
          </div>
          <div {...stylex.props(s.filter)}>
            <Input
              label="Search sets"
              type="search"
              value={q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Set name or year…"
            />
          </div>
        </div>
        <div {...stylex.props(s.between)}>
          <h2 {...stylex.props(s.h2)}>Original series</h2>
          <span {...stylex.props(s.muted)}>1999 · {shownSets.length} sets</span>
        </div>
        <div {...stylex.props(s.three)}>
          {shownSets.map((item) => (
            <RecordLink
              key={item.id}
              to={"/pokemon/sets/" + item.id}
              title={item.name}
              eyebrow="Original series · 1999"
              description={
                printings.filter((card) => card.setId === item.id).length + " sample cards"
              }
              visual={
                <div {...stylex.props(s.setCover)}>
                  <img
                    src={"/cards/" + item.id + "-logo.webp"}
                    alt=""
                    {...stylex.props(s.setLogo)}
                  />
                </div>
              }
            />
          ))}
        </div>
        {!shownSets.length && (
          <EmptyState
            title="No matching sets"
            description="Try Base Set, Jungle or Fossil."
            action={<Button onClick={() => update({ q: "" })}>Clear search</Button>}
          />
        )}
      </>
    );
  }
  return (
    <>
      {set && (
        <Breadcrumbs
          renderLink={renderRouterLink}
          items={[{ label: "Sets", href: "/pokemon/sets" }, { label: set.name }]}
        />
      )}
      <div {...stylex.props(s.between)}>
        <div {...stylex.props(s.stack)}>
          <h1 {...stylex.props(s.title)}>
            {set?.name ?? (q ? `Results for “${q}”` : "Pokémon cards")}
          </h1>
          <p {...stylex.props(s.muted)}>
            {set
              ? `Original series · 1999 · ${printings.filter((card) => card.setId === set.id).length} sample cards`
              : "Browse cards, narrow your search, then open a card for its details."}
          </p>
        </div>
        {set && <img src={"/cards/" + set.id + "-logo.webp"} alt="" {...stylex.props(s.setLogo)} />}
      </div>
      <div {...stylex.props(s.mobileFilters)}>
        <Button
          aria-expanded={filtersOpen}
          aria-controls="card-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={15} />
          {filtersOpen ? "Hide filters" : "Filters"}
          {[selectedSet, language, type, rarity].filter(Boolean).length
            ? " · " + [selectedSet, language, type, rarity].filter(Boolean).length
            : ""}
        </Button>
      </div>
      <section
        id="card-filters"
        aria-label="Filter cards"
        {...stylex.props(s.toolbar, s.filters, filtersOpen && s.filtersOpen)}
      >
        {!set && (
          <div {...stylex.props(s.filter)}>
            <Select
              label="Set"
              value={selectedSet}
              onValueChange={(set) => update({ set })}
              options={[
                { value: "", label: "All sets" },
                ...sets.map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
          </div>
        )}
        <div {...stylex.props(s.filter)}>
          <LanguageSelect
            includeAll
            value={language}
            onValueChange={(language) => update({ language })}
          />
        </div>
        <div {...stylex.props(s.filter)}>
          <Select
            label="Type"
            value={type}
            onValueChange={(type) => update({ type })}
            options={[
              { value: "", label: "All types" },
              ...Array.from(new Set(printings.map((card) => card.element)))
                .sort()
                .map((value) => ({ value, label: value })),
            ]}
          />
        </div>
        <div {...stylex.props(s.filter)}>
          <Select
            label="Rarity"
            value={rarity}
            onValueChange={(rarity) => update({ rarity })}
            options={[
              { value: "", label: "All rarities" },
              { value: "Rare Holo", label: "Rare Holo" },
              { value: "Common", label: "Common" },
            ]}
          />
        </div>
        {(q || language || rarity || type || selectedSet) && (
          <Button variant="ghost" onClick={clear}>
            Clear filters
          </Button>
        )}
      </section>
      {(q || language || rarity || type || selectedSet) && (
        <div {...stylex.props(s.row)}>
          {q && <FilterChip label={"Search: " + q} onRemove={() => update({ q: "" })} />}
          {selectedSet && !set && (
            <FilterChip label={setName(selectedSet)} onRemove={() => update({ set: "" })} />
          )}
          {language && (
            <FilterChip
              label={language === "fr" ? "French" : language === "en-US" ? "English" : language}
              onRemove={() => update({ language: "" })}
            />
          )}
          {type && <FilterChip label={type} onRemove={() => update({ type: "" })} />}
          {rarity && <FilterChip label={rarity} onRemove={() => update({ rarity: "" })} />}
        </div>
      )}
      <div {...stylex.props(s.resultBar)}>
        <span {...stylex.props(s.muted, s.resultCount)}>
          <strong>{matches.length}</strong> cards
          {set
            ? " in " + set.name
            : " across " + new Set(matches.map((card) => card.setId)).size + " sets"}{" "}
          · sample catalogue
        </span>
        <div {...stylex.props(s.resultControls)}>
          <div {...stylex.props(s.filter)}>
            <Select
              label="Sort"
              value={value("sort") === "name" ? "name" : "number"}
              onValueChange={(sort) => update({ sort })}
              options={[
                { value: "number", label: "Set / card number" },
                { value: "name", label: "Name A–Z" },
              ]}
            />
          </div>
          <Button
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            variant={view === "grid" ? "primary" : "default"}
            onClick={() => update({ view: "grid" })}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            aria-label="Table view"
            aria-pressed={view === "table"}
            variant={view === "table" ? "primary" : "default"}
            onClick={() => update({ view: "table" })}
          >
            <List size={16} />
          </Button>
        </div>
      </div>
      {!matches.length ? (
        <EmptyState
          title="No cards found"
          description="Try a different name or remove a filter. This sample includes English and French cards."
          action={<Button onClick={clear}>Reset filters</Button>}
        />
      ) : view === "table" ? (
        <DataTable label="Catalogue cards" data={shown} columns={columns} />
      ) : (
        <div {...stylex.props(s.grid)}>
          {shown.map((card) => (
            <PrintingTile key={card.id} card={card} />
          ))}
        </div>
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={matches.length}
        onPageChange={(page) => update({ page })}
      />
    </>
  );
}
