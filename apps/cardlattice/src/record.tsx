import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@imlunahey/components/button";
import { Badge } from "@imlunahey/components/badge";
import { Breadcrumbs } from "@imlunahey/components/breadcrumbs";
import { DescriptionList } from "@imlunahey/components/description-list";
import { Panel } from "@imlunahey/components/panel";
import { Dialog } from "@imlunahey/components/dialog";
import { CodeBlock } from "@imlunahey/components/code-block";
import { EmptyState } from "@imlunahey/components/empty-state";
import { printings, setName } from "./data";
import { CardArt } from "./card-art";
import { PrintingTile } from "./printing-tile";
import { CorrectionForm } from "./correction-form";
import { s } from "./styles";
export function Record() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const id = path.split("/").at(-1);
  const identity = path.includes("/cards/");
  const card = printings.find((item) => (identity ? item.cardId === id : item.id === id));
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(false);
  if (!card)
    return (
      <EmptyState
        title="Record not found"
        description="This record is not in the sample catalogue."
        action={
          <a href="/pokemon/sets" {...stylex.props(s.cta)}>
            Browse the catalogue
          </a>
        }
      />
    );
  const related = printings.filter(
    (item) => item.cardId === card.cardId && (identity || item.id !== card.id),
  );
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Catalogue", href: "/" },
          { label: "Pokémon", href: "/pokemon/sets" },
          { label: setName(card.setId), href: "/pokemon/sets/" + card.setId },
          { label: identity ? card.name + " · identity" : card.name },
        ]}
      />
      <section {...stylex.props(s.detail)}>
        <div {...stylex.props(s.detailVisual, s.stack)}>
          <CardArt card={card} />
          <p {...stylex.props(s.muted)}>
            Original abstract placeholder · not card artwork.
            <br />
            The catalogue works even when an image isn’t available.
          </p>
        </div>
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.eyebrow)}>
            {identity ? "Card identity" : setName(card.setId) + " / " + card.number}
          </span>
          <h1 {...stylex.props(s.title)}>{card.name}</h1>
          <p {...stylex.props(s.lead)}>
            {identity
              ? "One card identity. Follow its printings across the catalogue."
              : "A single printing, with every detail in its place."}
          </p>
          <div {...stylex.props(s.row)}>
            <Badge tone="neutral">{card.rarity}</Badge>
            <Badge tone="info">{card.element}</Badge>
            <Badge tone="neutral">{card.language === "fr" ? "French" : "English"}</Badge>
          </div>
          <DescriptionList
            items={[
              {
                label: "Set",
                value: (
                  <a href={"/pokemon/sets/" + card.setId} {...stylex.props(s.link, s.active)}>
                    {setName(card.setId)}
                  </a>
                ),
              },
              { label: "Collector number", value: card.number },
              { label: "Illustrator", value: card.artist },
              { label: "HP", value: card.hp },
              { label: "Finish", value: card.finish },
              {
                label: "Record ID",
                value: <span {...stylex.props(s.word)}>{identity ? card.cardId : card.id}</span>,
              },
            ]}
          />
          <div {...stylex.props(s.row)}>
            <Button variant="primary" onClick={() => setOpen(true)}>
              Suggest a correction
            </Button>
            <Button onClick={() => setData(!data)} aria-expanded={data}>
              {data ? "Hide JSON" : "View JSON"}
            </Button>
          </div>
          {!identity && (
            <a href={"/pokemon/cards/" + card.cardId} {...stylex.props(s.link)}>
              Explore this card’s identity and printings →
            </a>
          )}
          {data && (
            <CodeBlock code={JSON.stringify(card, null, 2)} label="Printing record · JSON" />
          )}
        </div>
      </section>
      <div {...stylex.props(s.two)}>
        <Panel title="Recorded details" description="Sample data provenance">
          <p {...stylex.props(s.muted)}>
            This demo record is a curated fixture used to explore the interface. It has not been
            submitted to, or verified by, the live catalogue.
          </p>
          <a href="/docs" {...stylex.props(s.link)}>
            Understand the data model →
          </a>
        </Panel>
        <Panel
          title="Notice something missing?"
          description="A catalogue improves one field at a time"
        >
          <p {...stylex.props(s.muted)}>
            Suggest a value with a source. Review the before and after before it becomes part of a
            catalogue.
          </p>
          <a href="/contribute" {...stylex.props(s.link)}>
            How contributions work →
          </a>
        </Panel>
      </div>
      <section {...stylex.props(s.section)}>
        <div {...stylex.props(s.between)}>
          <h2 {...stylex.props(s.h2)}>Related printings</h2>
          <span {...stylex.props(s.muted)}>{related.length} in the demo</span>
        </div>
        {related.length ? (
          <div {...stylex.props(s.grid)}>
            {related.map((item) => (
              <PrintingTile key={item.id} card={item} />
            ))}
          </div>
        ) : (
          <p {...stylex.props(s.muted)}>
            No other printings for this card are included in the sample. Explore{" "}
            <a href={"/pokemon/sets/" + card.setId} {...stylex.props(s.link)}>
              the rest of the set
            </a>
            .
          </p>
        )}
      </section>
      <Dialog title={"Suggest a correction · " + card.name} open={open} onOpenChange={setOpen}>
        {open && <CorrectionForm target={card.id} />}
      </Dialog>
    </>
  );
}
