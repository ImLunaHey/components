import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Panel } from "@imlunahey/components/panel";
import { Input } from "@imlunahey/components/input";
import { Select } from "@imlunahey/components/select";
import { LanguageSelect } from "@imlunahey/components/language-select";
import { DataTable } from "@imlunahey/components/data-table";
import { Progress } from "@imlunahey/components/progress";
import { Badge } from "@imlunahey/components/badge";
const sets = [
  {
    name: "Base Set",
    series: "Original",
    cards: 306,
    finishes: 300,
    illustrators: 293,
    status: "In progress",
  },
  {
    name: "Jungle",
    series: "Original",
    cards: 128,
    finishes: 128,
    illustrators: 128,
    status: "Done",
  },
  {
    name: "Fossil",
    series: "Original",
    cards: 124,
    finishes: 124,
    illustrators: 124,
    status: "Done",
  },
  {
    name: "Team Rocket",
    series: "Original",
    cards: 164,
    finishes: 164,
    illustrators: 164,
    status: "Done",
  },
  {
    name: "Gym Heroes",
    series: "Gym",
    cards: 86,
    finishes: 72,
    illustrators: 78,
    status: "In progress",
  },
  {
    name: "Gym Challenge",
    series: "Gym",
    cards: 0,
    finishes: 0,
    illustrators: 0,
    status: "Not started",
  },
]
  .map((set) => ({ ...set, language: "en-US" }))
  .concat([
    {
      name: "拡張パック",
      series: "Original",
      cards: 102,
      finishes: 100,
      illustrators: 98,
      status: "In progress",
      language: "ja",
    },
    {
      name: "Set de Base",
      series: "Original",
      cards: 102,
      finishes: 102,
      illustrators: 102,
      status: "Done",
      language: "fr",
    },
  ]);
export function App({ view }: { view: string }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [status, setStatus] = useState("all");
  const languageSets = sets.filter((set) => set.language === language);
  return (
    <Frame name="Cardlattice" view={view} items={[{ id: "sets", label: "Sets" }]}>
      <div {...stylex.props(layout.three)}>
        <Panel title="Printings">
          <div {...stylex.props(layout.metric)}>
            {languageSets.reduce((total, set) => total + set.cards, 0)}
          </div>
        </Panel>
        <Panel title="Sets">
          <div {...stylex.props(layout.metric)}>{languageSets.length}</div>
        </Panel>
        <Panel title="Languages">
          <div {...stylex.props(layout.metric)}>3</div>
        </Panel>
      </div>
      <Panel title="Set coverage">
        <div {...stylex.props(layout.three)}>
          <Progress
            label="Done"
            value={languageSets.filter((set) => set.status === "Done").length}
            max={languageSets.length}
            detail={languageSets.length + " sets in this language"}
            tone="success"
          />
          <Progress
            label="In progress"
            value={languageSets.filter((set) => set.status === "In progress").length}
            max={languageSets.length}
          />
          <Progress
            label="Not started"
            value={languageSets.filter((set) => set.status === "Not started").length}
            max={languageSets.length}
          />
        </div>
      </Panel>
      <Panel title="Sets">
        <div {...stylex.props(layout.row)}>
          <Input
            label="Search sets"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <LanguageSelect value={language} onValueChange={setLanguage} />
          <Select
            label="Status"
            value={status}
            onValueChange={setStatus}
            options={["all", "Done", "In progress", "Not started"].map((value) => ({
              value,
              label: value === "all" ? "All statuses" : value,
            }))}
          />
        </div>
        <DataTable
          label="Catalogue sets"
          data={languageSets.filter(
            (set) =>
              set.name.toLowerCase().includes(query.toLowerCase()) &&
              (status === "all" || set.status === status),
          )}
          columns={[
            { accessorKey: "name", header: "Set" },
            { accessorKey: "series", header: "Series" },
            { accessorKey: "language", header: "Language" },
            { accessorKey: "cards", header: "Printings" },
            { accessorKey: "finishes", header: "Finishes" },
            { accessorKey: "illustrators", header: "Illustrators" },
            {
              accessorKey: "status",
              header: "Status",
              cell: (info) => (
                <Badge
                  tone={
                    info.getValue() === "Done"
                      ? "success"
                      : info.getValue() === "In progress"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {String(info.getValue())}
                </Badge>
              ),
            },
          ]}
        />
      </Panel>
    </Frame>
  );
}
