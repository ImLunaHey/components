import { MediaImage } from "@imlunahey/components/media-image";
import { renderRouterLink } from "../../../src/demos/router-link";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Panel } from "@imlunahey/components/panel";
import { RecordLink } from "../../../src/demos/record-link";
import { DescriptionList } from "@imlunahey/components/description-list";
import { Breadcrumbs } from "@imlunahey/components/breadcrumbs";
import { FilterChip } from "@imlunahey/components/filter-chip";
import { Pagination } from "@imlunahey/components/pagination";
import { EmptyState } from "@imlunahey/components/empty-state";
import { CodeBlock } from "@imlunahey/components/code-block";
import { Button } from "@imlunahey/components/button";
import { layout } from "../../../src/demos/layout";
export function CatalogueExamples() {
  const [page, setPage] = useState(1);
  const [filtered, setFiltered] = useState(true);
  return (
    <div {...stylex.props(layout.grid)}>
      <Panel title="Record tiles and breadcrumbs">
        <Breadcrumbs
          renderLink={renderRouterLink}
          items={[{ label: "Components", href: "/" }, { label: "Catalogue patterns" }]}
        />
        <RecordLink
          to="/catalogue"
          eyebrow="RELEASE 01"
          title="A reusable catalogue tile"
          description="A linked record with optional artwork, metadata and a footer."
          footer="Metadata without a bespoke card layout"
        />
      </Panel>
      <Panel title="Description list">
        <DescriptionList
          items={[
            { label: "Name", value: "Base Set" },
            { label: "Language", value: "English" },
            { label: "Illustrator", value: null },
          ]}
        />
      </Panel>
      <Panel title="Filters and pagination">
        <div>
          {filtered ? (
            <FilterChip label="Language: English" onRemove={() => setFiltered(false)} />
          ) : (
            <Button onClick={() => setFiltered(true)}>Add language filter</Button>
          )}
        </div>
        <Pagination page={page} pageSize={8} total={18} onPageChange={setPage} />
      </Panel>
      <Panel title="Empty state">
        <EmptyState
          title="No matching records"
          description="Give people a useful next step when a search returns no results."
          action={<Button onClick={() => setFiltered(false)}>Reset filters</Button>}
        />
      </Panel>
      <Panel title="Image fallback">
        <MediaImage alt="Unavailable product photo" aspectRatio="16 / 9" />
      </Panel>
      <Panel title="Copyable code">
        <CodeBlock
          label="Record JSON"
          code={JSON.stringify(
            { id: "example-001", name: "Sample record", language: "en" },
            null,
            2,
          )}
        />
      </Panel>
    </div>
  );
}
