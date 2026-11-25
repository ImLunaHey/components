import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Layers, LayoutGrid, List } from "lucide-react";
import { Input } from "@imlunahey/components/input";
import { Select } from "@imlunahey/components/select";
import { LanguageSelect } from "@imlunahey/components/language-select";
import { Button } from "@imlunahey/components/button";
import { RecordTile } from "@imlunahey/components/record-tile";
import { Breadcrumbs } from "@imlunahey/components/breadcrumbs";
import { FilterChip } from "@imlunahey/components/filter-chip";
import { Pagination } from "@imlunahey/components/pagination";
import { EmptyState } from "@imlunahey/components/empty-state";
import { DataTable } from "@imlunahey/components/data-table";
import { Progress } from "@imlunahey/components/progress";
import { sets, printings, searchPrintings, setName, type Printing } from "./data";
import { PrintingTile } from "./printing-tile";
import { s } from "./styles";
const columns = [
  { accessorKey: "number", header: "No." },
  {
    accessorKey: "name",
    header: "Printing",
    cell: ({ row }: { row: { original: Printing } }) => (
      <a href={"/pokemon/printings/" + row.original.id} {...stylex.props(s.link, s.active)}>
        {row.original.name}
      </a>
    ),
  },
  { accessorKey: "rarity", header: "Rarity" },
  { accessorKey: "element", header: "Type" },
  { accessorKey: "finish", header: "Finish" },
  {
    accessorKey: "artist",
    header: "Illustrator",
    cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() ?? "Not recorded"),
  },
];
export function Catalogue() {
  const location = useRouterState({ select: (state) => state.location });
  const navigate = useNavigate();
  const search = location.search as Record<string, unknown>;
  const q = typeof search.q === "string" ? search.q : "";
  const language = typeof search.language === "string" ? search.language : "";
  const rarity = typeof search.rarity === "string" ? search.rarity : "";
  const view = search.view === "table" ? "table" : "grid";
  const order = search.sort === "name" ? "name" : "number";
  const setId = location.pathname.startsWith("/pokemon/sets/")
    ? location.pathname.split("/")[3]
    : undefined;
  const set = sets.find((item) => item.id === setId);
  const isSets = location.pathname === "/pokemon/sets" || location.pathname === "/pokemon";
  const isSearch = location.pathname === "/search";
  function update(patch: Record<string, string | number>) {
    void navigate({
      to: location.pathname,
      search: { ...search, ...patch, page: patch.page ?? 1 },
      replace: true,
      resetScroll: false,
    });
  }
  if (setId && !set)
    return (
      <EmptyState
        title="Set not found"
        description="This set is not included in the demo."
        action={
          <a href="/pokemon/sets" {...stylex.props(s.cta)}>
            Browse sets
          </a>
        }
      />
    );
  const matches = searchPrintings(q)
    .filter(
      (card) =>
        (!setId || card.setId === setId) &&
        (!language || card.language === language) &&
        (!rarity || card.rarity === rarity),
    )
    .sort((a, b) =>
      order === "name"
        ? a.name.localeCompare(b.name)
        : a.number.localeCompare(b.number) || a.name.localeCompare(b.name),
    );
  const pageSize = 8;
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(matches.length / pageSize) || 1,
      Number.isSafeInteger(Number(search.page)) ? Number(search.page) : 1,
    ),
  );
  const shown = matches.slice((page - 1) * pageSize, page * pageSize);
  const title =
    set?.name ??
    (isSets
      ? "A catalogue of beginnings."
      : isSearch
        ? "Find your next discovery."
        : "Every printing, in context.");
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Catalogue", href: "/" },
          { label: "Pokémon", href: isSets ? undefined : "/pokemon/sets" },
          ...(set ? [{ label: set.name }] : []),
        ]}
      />
      <div {...stylex.props(s.between)}>
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.eyebrow)}>
            {set
              ? set.series + " / " + set.year
              : isSearch
                ? "Across the catalogue"
                : "Pokémon Trading Card Game"}
          </span>
          <h1 {...stylex.props(s.title)}>{title}</h1>
          <p {...stylex.props(s.lead)}>
            {set?.description ??
              (isSets
                ? "Browse by set. Follow a card through its printings. Find the details that connect them."
                : "Search the sample catalogue by name, set, collector number or illustrator.")}
          </p>
        </div>
        {set && <span {...stylex.props(s.symbol)}>{set.symbol}</span>}
      </div>
      {set && (
        <div {...stylex.props(s.two)}>
          <Progress
            label="Illustrators recorded"
            value={printings.filter((card) => card.setId === setId && card.artist).length}
            max={printings.filter((card) => card.setId === setId).length}
            detail="Coverage of sample records, not the complete set"
          />
          <p {...stylex.props(s.muted)}>
            Sample catalogue · {printings.filter((card) => card.setId === setId).length} printings
            across{" "}
            {
              new Set(printings.filter((card) => card.setId === setId).map((card) => card.language))
                .size
            }{" "}
            languages.
          </p>
        </div>
      )}
      <div {...stylex.props(s.toolbar)}>
        <div {...stylex.props(s.grow)}>
          <Input
            label={isSets ? "Search sets" : "Search printings"}
            type="search"
            placeholder={isSets ? "Find a set…" : "Name, number, illustrator…"}
            value={q}
            onChange={(event) => update({ q: event.target.value })}
          />
        </div>
        {!isSets && (
          <>
            <div {...stylex.props(s.filter)}>
              <LanguageSelect
                value={language}
                onValueChange={(value) => update({ language: value })}
                includeAll
              />
            </div>
            <div {...stylex.props(s.filter)}>
              <Select
                label="Rarity"
                value={rarity}
                onValueChange={(value) => update({ rarity: value })}
                options={[
                  { value: "", label: "All rarities" },
                  { value: "Rare Holo", label: "Rare Holo" },
                  { value: "Common", label: "Common" },
                ]}
              />
            </div>
            <div {...stylex.props(s.filter)}>
              <Select
                label="Sort"
                value={order}
                onValueChange={(sort) => update({ sort })}
                options={[
                  { value: "number", label: "Collector number" },
                  { value: "name", label: "Name A–Z" },
                ]}
              />
            </div>
            <div {...stylex.props(s.row)}>
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
          </>
        )}
      </div>
      {(q || language || rarity) && (
        <div {...stylex.props(s.row)}>
          {q && <FilterChip label={"Search: " + q} onRemove={() => update({ q: "" })} />}{" "}
          {!isSets && language && (
            <FilterChip label={"Language: " + language} onRemove={() => update({ language: "" })} />
          )}{" "}
          {!isSets && rarity && (
            <FilterChip label={rarity} onRemove={() => update({ rarity: "" })} />
          )}
          <Button variant="ghost" onClick={() => update({ q: "", language: "", rarity: "" })}>
            Clear filters
          </Button>
        </div>
      )}
      {isSets ? (
        <>
          <div {...stylex.props(s.three)}>
            {sets
              .filter((item) =>
                (item.name + " " + item.year).toLowerCase().includes(q.toLowerCase()),
              )
              .map((item) => (
                <RecordTile
                  key={item.id}
                  href={"/pokemon/sets/" + item.id}
                  title={item.name}
                  eyebrow={item.series}
                  description={
                    item.year +
                    " · " +
                    printings.filter((card) => card.setId === item.id).length +
                    " demo printings"
                  }
                  visual={
                    <div {...stylex.props(s.setVisual)}>
                      <Layers size={36} />
                      <span {...stylex.props(s.symbol)}>{item.symbol}</span>
                    </div>
                  }
                />
              ))}
          </div>
          {!sets.some((item) =>
            (item.name + " " + item.year).toLowerCase().includes(q.toLowerCase()),
          ) && (
            <EmptyState
              title="No matching sets"
              description="Try Base Set, Jungle or Fossil."
              action={<Button onClick={() => update({ q: "" })}>Clear search</Button>}
            />
          )}
        </>
      ) : (
        <>
          {isSearch &&
            q &&
            sets.some((item) => item.name.toLowerCase().includes(q.toLowerCase())) && (
              <section {...stylex.props(s.section)}>
                <h2 {...stylex.props(s.h2)}>Matching sets</h2>
                <div {...stylex.props(s.three)}>
                  {sets
                    .filter((item) => item.name.toLowerCase().includes(q.toLowerCase()))
                    .map((item) => (
                      <RecordTile
                        key={item.id}
                        title={item.name}
                        href={"/pokemon/sets/" + item.id}
                        description={item.year}
                      />
                    ))}
                </div>
              </section>
            )}
          <div {...stylex.props(s.between)}>
            <h2 {...stylex.props(s.h2)}>{isSearch ? "Printings" : "In this catalogue"}</h2>
            <span {...stylex.props(s.muted)}>{matches.length} results</span>
          </div>
          {matches.length === 0 ? (
            <EmptyState
              title="No printings found"
              description="Try a different name or remove a filter. Only English and French sample records are included."
              action={
                <Button onClick={() => update({ q: "", language: "", rarity: "" })}>
                  Reset filters
                </Button>
              }
            />
          ) : view === "table" ? (
            <DataTable label="Catalogue printings" data={shown} columns={columns} />
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
            onPageChange={(next) => update({ page: next })}
          />
        </>
      )}
      <div {...stylex.props(s.between)}>
        <span {...stylex.props(s.muted)}>
          Something missing? Every correction makes the catalogue better.
        </span>
        <a href="/contribute" {...stylex.props(s.link)}>
          Suggest a correction ↗
        </a>
      </div>
    </>
  );
}
