import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@imlunahey/components/button";
import { Badge } from "@imlunahey/components/badge";
import { Breadcrumbs } from "@imlunahey/components/breadcrumbs";
import { DescriptionList } from "@imlunahey/components/description-list";
import { Dialog } from "@imlunahey/components/dialog";
import { CodeBlock } from "@imlunahey/components/code-block";
import { EmptyState } from "@imlunahey/components/empty-state";
import { renderRouterLink } from "../../../src/demos/router-link";
import { printings, setName, filterPrintings } from "./data";
import { CardArt } from "./card-art";
import { PrintingTile } from "./printing-tile";
import { CorrectionForm } from "./correction-form";
import { s } from "./styles";
export function Record() {
  const location = useRouterState({ select: (state) => state.location });
  const id = location.pathname.split("/").at(-1);
  const identity = location.pathname.includes("/cards/");
  const card = printings.find((item) => (identity ? item.cardId === id : item.id === id));
  const [open, setOpen] = useState(false),
    [data, setData] = useState(false),
    [zoom, setZoom] = useState(false);
  const search = location.search as { origin?: string; browse?: Record<string, unknown> };
  const origin = search.origin ?? "/pokemon/cards",
    browse = search.browse ?? {};
  const context = { origin, browse };
  const results = filterPrintings(
    browse,
    origin.startsWith("/pokemon/sets/") ? origin.split("/")[3] : undefined,
  );
  if (!card)
    return (
      <EmptyState
        title="Card not found"
        description="This card is not included in the demo."
        action={
          <Link to="/pokemon/cards" {...stylex.props(s.cta)}>
            Browse cards
          </Link>
        }
      />
    );
  const index = results.findIndex((item) => item.id === card.id),
    previous = results[index - 1],
    next = index >= 0 ? results[index + 1] : undefined;
  const related = printings.filter((item) => item.cardId === card.cardId && item.id !== card.id);
  return (
    <>
      <div {...stylex.props(s.between)}>
        <Link to={origin} search={browse} {...stylex.props(s.outlineLink)}>
          <ArrowLeft size={15} />
          Back to results
        </Link>
        <nav aria-label="Card navigation" {...stylex.props(s.row)}>
          {index >= 0 && (
            <span {...stylex.props(s.muted)}>
              {index + 1} of {results.length}
            </span>
          )}
          {previous ? (
            <Link
              aria-label="Previous card"
              to={"/pokemon/printings/" + previous.id}
              search={context}
              {...stylex.props(s.outlineLink)}
            >
              <ChevronLeft size={16} />
              Previous
            </Link>
          ) : (
            <Button disabled aria-label="Previous card">
              Previous
            </Button>
          )}
          {next ? (
            <Link
              aria-label="Next card"
              to={"/pokemon/printings/" + next.id}
              search={context}
              {...stylex.props(s.outlineLink)}
            >
              Next
              <ChevronRight size={16} />
            </Link>
          ) : (
            <Button disabled aria-label="Next card">
              Next
            </Button>
          )}
        </nav>
      </div>
      <Breadcrumbs
        renderLink={renderRouterLink}
        items={[
          { label: "Sets", href: "/pokemon/sets" },
          { label: setName(card.setId), href: "/pokemon/sets/" + card.setId },
          { label: card.name },
        ]}
      />
      <section {...stylex.props(s.detail)}>
        <div {...stylex.props(s.detailVisual, s.stack)}>
          <CardArt card={card} eager />
          <Button onClick={() => setZoom(true)}>
            <Maximize2 size={15} />
            Enlarge image
          </Button>
          <p {...stylex.props(s.muted)}>Card image via TCGdex.</p>
        </div>
        <div {...stylex.props(s.stack)}>
          <div {...stylex.props(s.stack)}>
            <h1 {...stylex.props(s.title)}>{card.name}</h1>
            <div {...stylex.props(s.row)}>
              <Link to={"/pokemon/sets/" + card.setId} {...stylex.props(s.link)}>
                {setName(card.setId)}
              </Link>
              <span {...stylex.props(s.muted)}>
                #{card.number} · {card.language === "fr" ? "French" : "English"}
              </span>
            </div>
            <div {...stylex.props(s.row)}>
              <Badge>{card.rarity}</Badge>
              <Badge tone="info">{card.element}</Badge>
              <Badge>{card.hp} HP</Badge>
            </div>
          </div>
          <div {...stylex.props(s.detailsBox)}>
            <h2 {...stylex.props(s.h2)}>Card details</h2>
            <DescriptionList
              items={[
                {
                  label: "Set",
                  value: (
                    <Link to={"/pokemon/sets/" + card.setId} {...stylex.props(s.link, s.active)}>
                      {setName(card.setId)}
                    </Link>
                  ),
                },
                { label: "Card number", value: card.number },
                { label: "Language", value: card.language === "fr" ? "French" : "English" },
                { label: "Rarity", value: card.rarity },
                { label: "Finish", value: card.finish },
                { label: "Illustrator", value: card.artist },
              ]}
            />
            <div {...stylex.props(s.row)}>
              <Button onClick={() => setOpen(true)}>Suggest a correction</Button>
              <Button variant="ghost" onClick={() => setData(!data)} aria-expanded={data}>
                {data ? "Hide JSON" : "View JSON"}
              </Button>
            </div>
            {data && <CodeBlock code={JSON.stringify(card, null, 2)} label="Card record · JSON" />}
          </div>
          <section {...stylex.props(s.stack)}>
            <h2 {...stylex.props(s.h2)}>Other printings</h2>
            {related.length ? (
              <div {...stylex.props(s.relatedGrid)}>
                {related.map((item) => (
                  <PrintingTile key={item.id} card={item} />
                ))}
              </div>
            ) : (
              <p {...stylex.props(s.muted)}>
                No other printings of this card are included in the sample.
              </p>
            )}
          </section>
          <p {...stylex.props(s.muted)}>
            Sample metadata ·{" "}
            <Link to="/data" {...stylex.props(s.link)}>
              About this data
            </Link>
            {!identity && (
              <>
                {" "}
                ·{" "}
                <Link
                  to={"/pokemon/cards/" + card.cardId}
                  search={context}
                  {...stylex.props(s.link)}
                >
                  Card identity
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
      <Dialog title={"Suggest a correction · " + card.name} open={open} onOpenChange={setOpen}>
        {open && <CorrectionForm target={card.id} />}
      </Dialog>
      <Dialog title={card.name + " · card image"} open={zoom} onOpenChange={setZoom}>
        {zoom && <CardArt card={card} eager />}
      </Dialog>
    </>
  );
}
