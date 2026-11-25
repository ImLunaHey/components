import * as stylex from "@stylexjs/stylex";
import { ArrowRight, Layers, ArrowUpRight } from "lucide-react";
import { RecordTile } from "@imlunahey/components/record-tile";
import { s } from "./styles";
import { sets, printings } from "./data";
import { PrintingTile } from "./printing-tile";
import { CardArt } from "./card-art";
import { SearchForm } from "./search-form";
export function Home() {
  return (
    <>
      <section {...stylex.props(s.hero)}>
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.eyebrow)}>An open catalogue. A shared curiosity.</span>
          <h1 {...stylex.props(s.heroTitle)}>
            Every card has
            <br />a bigger story.
          </h1>
          <p {...stylex.props(s.lead)}>
            Discover the sets, printings and details behind the cards. Carefully organised. Open to
            everyone.
          </p>
          <SearchForm />
          <div {...stylex.props(s.row)}>
            <a href="/pokemon/sets" {...stylex.props(s.link)}>
              Explore Pokémon <ArrowRight size={13} />
            </a>
            <span {...stylex.props(s.muted)}>or try Charizard, Jungle, 004</span>
          </div>
        </div>
        <div {...stylex.props(s.heroCards)}>
          <div {...stylex.props(s.heroCard)}>
            <CardArt card={printings[0]!} />
          </div>
          <div {...stylex.props(s.heroCardTwo)}>
            <CardArt card={printings[1]!} />
          </div>
        </div>
      </section>
      <div {...stylex.props(s.strip)}>
        <span>
          <strong {...stylex.props(s.stat)}>{sets.length}</strong>{" "}
          <span {...stylex.props(s.muted)}>sample sets</span>
        </span>
        <span>
          <strong {...stylex.props(s.stat)}>{printings.length}</strong>{" "}
          <span {...stylex.props(s.muted)}>sample printings</span>
        </span>
        <span>
          <strong {...stylex.props(s.stat)}>2</strong>{" "}
          <span {...stylex.props(s.muted)}>languages</span>
        </span>
        <a href="/coverage" {...stylex.props(s.link)}>
          Explore catalogue coverage ↗
        </a>
      </div>
      <section {...stylex.props(s.section)}>
        <div {...stylex.props(s.between)}>
          <div>
            <span {...stylex.props(s.eyebrow)}>Start with a set</span>
            <h2 {...stylex.props(s.h2)}>The original chapters.</h2>
          </div>
          <a href="/pokemon/sets" {...stylex.props(s.link)}>
            Browse all sets <ArrowRight size={13} />
          </a>
        </div>
        <div {...stylex.props(s.three)}>
          {sets.map((set) => (
            <RecordTile
              key={set.id}
              href={"/pokemon/sets/" + set.id}
              title={set.name}
              eyebrow={set.series}
              description={`${set.year} · ${printings.filter((card) => card.setId === set.id).length} demo printings`}
              visual={
                <div {...stylex.props(s.setVisual)}>
                  <Layers size={32} strokeWidth={1} />
                  <span {...stylex.props(s.symbol)}>{set.symbol}</span>
                </div>
              }
            />
          ))}
        </div>
      </section>
      <section {...stylex.props(s.section)}>
        <div {...stylex.props(s.between)}>
          <div>
            <span {...stylex.props(s.eyebrow)}>A closer look</span>
            <h2 {...stylex.props(s.h2)}>Familiar faces. Finer details.</h2>
          </div>
          <a href="/pokemon/cards" {...stylex.props(s.link)}>
            Explore cards ↗
          </a>
        </div>
        <div {...stylex.props(s.grid)}>
          {[printings[0]!, printings[3]!, printings[9]!, printings[14]!].map((card) => (
            <PrintingTile key={card.id} card={card} />
          ))}
        </div>
      </section>
      <section {...stylex.props(s.strip, s.between)}>
        <div {...stylex.props(s.stack)}>
          <span {...stylex.props(s.eyebrow)}>For the things you’ll build next</span>
          <h2 {...stylex.props(s.h2)}>Take the catalogue with you.</h2>
          <p {...stylex.props(s.muted)}>
            Explore the data model or download this demo’s JSON snapshot.
          </p>
        </div>
        <div {...stylex.props(s.row)}>
          <a href="/data" {...stylex.props(s.cta)}>
            Explore the data <ArrowUpRight size={15} />
          </a>
          <a href="/docs" {...stylex.props(s.outlineLink)}>
            Read the docs
          </a>
        </div>
      </section>
    </>
  );
}
