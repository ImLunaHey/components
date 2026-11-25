import { useCatalogue } from "./catalogue-provider";
import { number } from "./data";
import { catalogueBase } from "./snapshot";
import { Link } from "@tanstack/react-router";
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

import { CorrectionForm, readCorrections, type Correction } from "./correction-form";
import { s } from "./styles";
export function Information({ page }: { page: string }) {
  const { sets, printings, manifest, sourceRecords } = useCatalogue();
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
        [
          JSON.stringify(
            {
              schemaVersion: manifest.schemaVersion,
              sourceCommit: manifest.sourceCommit,
              records: sourceRecords,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cardlattice-catalogue.json";
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
        <h1 {...stylex.props(s.title)}>Catalogue coverage</h1>
        <p {...stylex.props(s.lead)}>
          Counts and missing fields come from the published snapshot. Set totals are recorded
          printings, not estimates of how complete a set is.
        </p>
        <div {...stylex.props(s.three)}>
          <Panel title="Recorded printings">
            <span {...stylex.props(s.stat)}>{number(printings.length)}</span>
            <p {...stylex.props(s.muted)}>Across {sets.length} sets</p>
          </Panel>
          <Panel title="Illustrators recorded">
            <Progress
              label="Illustrators"
              value={recorded}
              max={printings.length}
              detail={`${recorded} of ${printings.length} published printings`}
            />
          </Panel>
          <Panel title="Open fields">
            <span {...stylex.props(s.stat)}>{printings.length - recorded}</span>
            <p {...stylex.props(s.muted)}>Illustrator details still to record</p>
          </Panel>
        </div>
        <DataTable
          label="Published catalogue coverage"
          data={coverage}
          columns={[
            { accessorKey: "name", header: "Set" },
            { accessorKey: "total", header: "Recorded printings" },
            { accessorKey: "artists", header: "Illustrators recorded" },
            {
              id: "missing",
              header: "Missing",
              cell: ({ row }) => row.original.total - row.original.artists,
            },
          ]}
        />
        <Link to="/contribute" {...stylex.props(s.link)}>
          Help fill a gap →
        </Link>
      </>
    );
  }
  if (page === "data")
    return (
      <div {...stylex.props(s.narrow)}>
        <span {...stylex.props(s.eyebrow)}>Build something of your own</span>
        <h1 {...stylex.props(s.title)}>Catalogue data</h1>
        <p {...stylex.props(s.lead)}>
          Download exactly what powers this demo. No account or API key needed.
        </p>
        <Panel title="Verified catalogue snapshot" actions={<Badge tone="neutral">JSON</Badge>}>
          <DescriptionList
            items={[
              { label: "Sets", value: sets.length },
              { label: "Printings", value: printings.length },
              {
                label: "Includes",
                value: "Published metadata · artwork loaded separately from TCGdex",
              },
              { label: "Source", value: "Cardlattice published snapshot" },
              { label: "Revision", value: manifest.sourceCommit.slice(0, 12) },
            ]}
          />
          <Button variant="primary" onClick={download}>
            Download catalogue JSON
          </Button>
        </Panel>
        <CodeBlock
          label="Snapshot shape"
          code={JSON.stringify(
            {
              schemaVersion: manifest.schemaVersion,
              sourceCommit: manifest.sourceCommit,
              records: sourceRecords.filter((r) => r.metadata.kind === "printing").slice(0, 1),
            },
            null,
            2,
          )}
        />
        <p {...stylex.props(s.muted)}>
          Download{" "}
          <a href={catalogueBase + manifest.filename} {...stylex.props(s.link)}>
            the original verified snapshot ↗
          </a>
          . This demo does not expose a live API.
        </p>
      </div>
    );
  if (page === "docs")
    return (
      <div {...stylex.props(s.narrow)}>
        <span {...stylex.props(s.eyebrow)}>A few useful distinctions</span>
        <h1 {...stylex.props(s.title)}>About the catalogue</h1>
        <p {...stylex.props(s.lead)}>
          A card, its printing and its artwork are related—but each answers a different question.
        </p>
        {[
          {
            title: "01 / Card identity",
            text: "The identity linked to a printing. Published identities are currently provisional and scoped by printing; matching names do not establish a shared identity.",
            href: "/pokemon/cards/" + printings[0]!.cardId,
            action: "Explore a card identity",
          },
          {
            title: "02 / Printing",
            text: "A version of a card in a particular set and language. Collector numbers, rarity and finishes belong here.",
            href: "/pokemon/printings/" + printings[0]!.id,
            action: "Inspect a printing",
          },
          {
            title: "03 / Set",
            text: "The release that brings printings together. Browse visually or compare details in a table.",
            href: "/pokemon/sets/" + printings[0]!.setId,
            action: "Browse a set",
          },
        ].map((item) => (
          <Panel key={item.title} title={item.title}>
            <p {...stylex.props(s.lead)}>{item.text}</p>
            <Link to={item.href} {...stylex.props(s.link)}>
              {item.action} →
            </Link>
          </Panel>
        ))}
        <Panel title="Stable links, useful filters">
          <p {...stylex.props(s.muted)}>
            Records have their own addresses. Search terms, languages, rarity, sorting, pages and
            view preferences stay in the URL, so you can share a filtered view or return to it.
          </p>
          <CodeBlock
            label="Example catalogue URL"
            code="/pokemon/sets/pokemon-base-set?language=nl&rarity=Rare&view=table"
          />
        </Panel>
      </div>
    );
  return (
    <div {...stylex.props(s.narrow)}>
      <span {...stylex.props(s.eyebrow)}>Better, together</span>
      <h1 {...stylex.props(s.title)}>
        {page === "review"
          ? "Suggest and review corrections"
          : "One correction makes a difference."}
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
              <Link to="/contribute" {...stylex.props(s.cta)}>
                Suggest a correction
              </Link>
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
              Demo review only. This does not change the published catalogue.
            </p>
          </Panel>
        ))
      )}
      <p role="status">{message}</p>
    </div>
  );
}
