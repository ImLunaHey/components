import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@imlunahey/components/button";
import { Panel } from "@imlunahey/components/panel";
import { Badge } from "@imlunahey/components/badge";
import { DataTable } from "@imlunahey/components/data-table";
import { Progress } from "@imlunahey/components/progress";
import { CodeBlock } from "@imlunahey/components/code-block";
import { DescriptionList } from "@imlunahey/components/description-list";
import { EmptyState } from "@imlunahey/components/empty-state";
import { sets, printings, setName, sampleNotice } from "./data";
import { CorrectionForm, readCorrections, type Correction } from "./correction-form";
import { s } from "./styles";
export function Information({ page }: { page: string }) {
  const [corrections, setCorrections] = useState(readCorrections);
  const [message, setMessage] = useState("");
  function review(id: string, status: Correction["status"]) {
    const next = corrections.map((item) => (item.id === id ? { ...item, status } : item));
    try {
      localStorage.setItem("cardlattice-demo-corrections", JSON.stringify(next));
      setCorrections(next);
    } catch {
      setMessage("Could not save the review in this browser.");
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify({ demo: true, description: sampleNotice, sets, printings }, null, 2)],
        { type: "application/json" },
      ),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cardlattice-demo.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (page === "coverage") {
    const recorded = printings.filter((card) => card.artist).length;
    const coverage = sets.map((set) => ({
      name: set.name,
      total: printings.filter((card) => card.setId === set.id).length,
      artists: printings.filter((card) => card.setId === set.id && card.artist).length,
    }));
    return (
      <>
        <span {...stylex.props(s.eyebrow)}>Know what’s here. See what’s next.</span>
        <h1 {...stylex.props(s.title)}>An honest picture.</h1>
        <p {...stylex.props(s.lead)}>
          Coverage is measured against these sample records. It does not represent the completeness
          of a real set or the live catalogue.
        </p>
        <div {...stylex.props(s.three)}>
          <Panel title="Sample printings">
            <span {...stylex.props(s.stat)}>{printings.length}</span>
            <p {...stylex.props(s.muted)}>Across {sets.length} sets</p>
          </Panel>
          <Panel title="Illustrators recorded">
            <Progress
              label="Illustrators"
              value={recorded}
              max={printings.length}
              detail={`${recorded} of ${printings.length} sample printings`}
            />
          </Panel>
          <Panel title="Open fields">
            <span {...stylex.props(s.stat)}>{printings.length - recorded}</span>
            <p {...stylex.props(s.muted)}>Illustrator details still to record</p>
          </Panel>
        </div>
        <DataTable
          label="Sample catalogue coverage"
          data={coverage}
          columns={[
            { accessorKey: "name", header: "Set" },
            { accessorKey: "total", header: "Sample printings" },
            { accessorKey: "artists", header: "Illustrators recorded" },
            {
              id: "missing",
              header: "Missing",
              cell: ({ row }) => row.original.total - row.original.artists,
            },
          ]}
        />
        <a href="/contribute" {...stylex.props(s.link)}>
          Help fill a gap →
        </a>
      </>
    );
  }
  if (page === "data")
    return (
      <div {...stylex.props(s.narrow)}>
        <span {...stylex.props(s.eyebrow)}>Build something of your own</span>
        <h1 {...stylex.props(s.title)}>The data, in your hands.</h1>
        <p {...stylex.props(s.lead)}>
          Download exactly what powers this demo. No account or API key needed.
        </p>
        <Panel title="Demo catalogue snapshot" actions={<Badge tone="neutral">JSON</Badge>}>
          <DescriptionList
            items={[
              { label: "Sets", value: sets.length },
              { label: "Printings", value: printings.length },
              { label: "Includes", value: "Sample metadata only · no artwork" },
              { label: "Source", value: "Bundled design demo fixtures" },
            ]}
          />
          <Button variant="primary" onClick={download}>
            Download demo JSON
          </Button>
        </Panel>
        <CodeBlock
          label="Snapshot shape"
          code={JSON.stringify(
            {
              demo: true,
              sets: [{ id: "base-set", name: "Base Set" }],
              printings: [
                { id: "base-set-004", cardId: "charizard", setId: "base-set", name: "Charizard" },
              ],
            },
            null,
            2,
          )}
        />
        <p {...stylex.props(s.muted)}>
          For published data, visit{" "}
          <a href="https://cardlattice.com/datasets" {...stylex.props(s.link)}>
            Cardlattice’s dataset page ↗
          </a>
          . This demo does not expose a live API.
        </p>
      </div>
    );
  if (page === "docs")
    return (
      <div {...stylex.props(s.narrow)}>
        <span {...stylex.props(s.eyebrow)}>A few useful distinctions</span>
        <h1 {...stylex.props(s.title)}>A catalogue that connects.</h1>
        <p {...stylex.props(s.lead)}>
          A card, its printing and its artwork are related—but each answers a different question.
        </p>
        {[
          {
            title: "01 / Card identity",
            text: "The card itself, independent of a specific release or language. Start here to explore related printings.",
            href: "/pokemon/cards/charizard",
            action: "Explore Charizard’s identity",
          },
          {
            title: "02 / Printing",
            text: "A version of a card in a particular set and language. Collector numbers, rarity and finishes belong here.",
            href: "/pokemon/printings/base-set-004",
            action: "Inspect a printing",
          },
          {
            title: "03 / Set",
            text: "The release that brings printings together. Browse visually or compare details in a table.",
            href: "/pokemon/sets/base-set",
            action: "Browse Base Set",
          },
        ].map((item) => (
          <Panel key={item.title} title={item.title}>
            <p {...stylex.props(s.lead)}>{item.text}</p>
            <a href={item.href} {...stylex.props(s.link)}>
              {item.action} →
            </a>
          </Panel>
        ))}
        <Panel title="Stable links, useful filters">
          <p {...stylex.props(s.muted)}>
            Records have their own addresses. Search terms, languages, rarity, sorting, pages and
            view preferences stay in the URL, so you can share a filtered view or return to it.
          </p>
          <CodeBlock
            label="Example catalogue URL"
            code="/pokemon/sets/base-set?language=en-US&rarity=Rare%20Holo&view=table"
          />
        </Panel>
      </div>
    );
  return (
    <div {...stylex.props(s.narrow)}>
      <span {...stylex.props(s.eyebrow)}>Better, together</span>
      <h1 {...stylex.props(s.title)}>
        {page === "review" ? "Review the details." : "One correction makes a difference."}
      </h1>
      <p {...stylex.props(s.lead)}>
        Propose a change, attach a source, then compare the values. This demo saves proposals in
        your browser only.
      </p>
      {page !== "review" && (
        <Panel title="Suggest a correction">
          <CorrectionForm onSaved={() => setCorrections(readCorrections())} />
        </Panel>
      )}
      <div {...stylex.props(s.between)}>
        <h2 {...stylex.props(s.h2)}>Local review queue</h2>
        <Badge tone="neutral">{corrections.length} proposals</Badge>
      </div>
      {!corrections.length ? (
        <EmptyState
          title="Nothing to review yet"
          description="Submit a correction above or from a printing page."
          action={
            page === "review" ? (
              <a href="/contribute" {...stylex.props(s.cta)}>
                Suggest a correction
              </a>
            ) : undefined
          }
        />
      ) : (
        corrections.map((item) => (
          <Panel
            key={item.id}
            title={
              (printings.find((card) => card.id === item.target)?.name ?? item.target) +
              " · " +
              item.field
            }
            actions={
              <Badge
                tone={
                  item.status === "Accepted"
                    ? "success"
                    : item.status === "Rejected"
                      ? "danger"
                      : "warning"
                }
              >
                {item.status}
              </Badge>
            }
          >
            <DescriptionList
              items={[
                { label: "Current", value: item.before },
                { label: "Proposed", value: item.after },
                { label: "Evidence", value: item.source },
              ]}
            />
            {item.status === "Pending" && (
              <div {...stylex.props(s.row)}>
                <Button variant="primary" onClick={() => review(item.id, "Accepted")}>
                  Accept in demo
                </Button>
                <Button onClick={() => review(item.id, "Rejected")}>Reject</Button>
              </div>
            )}
            <p {...stylex.props(s.muted)}>
              Demo review only. The live catalogue and the sample records are unchanged.
            </p>
          </Panel>
        ))
      )}
      <p role="status">{message}</p>
    </div>
  );
}
