import { useCatalogue } from "./catalogue-provider";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Input } from "@imlunahey/components/input";
import { Textarea } from "@imlunahey/components/textarea";
import { Select } from "@imlunahey/components/select";
import { Combobox } from "@imlunahey/components/combobox";
import { Button } from "@imlunahey/components/button";
import { DescriptionList } from "@imlunahey/components/description-list";

import { s } from "./styles";
export type Correction = {
  id: string;
  target: string;
  field: string;
  before: string;
  after: string;
  source: string;
  status: "Pending" | "Accepted" | "Rejected";
};
export function readCorrections(): Correction[] {
  try {
    const data = JSON.parse(localStorage.getItem("cardlattice-demo-corrections") ?? "[]");
    return Array.isArray(data)
      ? data.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.target === "string" &&
            typeof item.field === "string" &&
            typeof item.before === "string" &&
            typeof item.after === "string" &&
            typeof item.source === "string" &&
            ["Pending", "Accepted", "Rejected"].includes(item.status),
        )
      : [];
  } catch {
    return [];
  }
}
export function CorrectionForm({
  target: initial,
  onSaved,
}: {
  target?: string;
  onSaved?: () => void;
}) {
  const { printings } = useCatalogue();
  const [target, setTarget] = useState(initial ?? printings[0]!.id);
  const [field, setField] = useState("artist");
  const [after, setAfter] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const record = printings.find((card) => card.id === target)!;
  const before = String(record[field as keyof typeof record] ?? "Not recorded");
  return (
    <form
      {...stylex.props(s.stack)}
      onSubmit={(event) => {
        event.preventDefault();
        if (!after.trim()) {
          setMessage("Enter the corrected value.");
          return;
        }
        try {
          const correction: Correction = {
            id: crypto.randomUUID(),
            target,
            field,
            before,
            after: after.trim(),
            source,
            status: "Pending",
          };
          localStorage.setItem(
            "cardlattice-demo-corrections",
            JSON.stringify([...readCorrections(), correction]),
          );
          setMessage("Correction saved locally for review. Nothing was sent to Cardlattice.");
          setAfter("");
          onSaved?.();
        } catch {
          setMessage("Could not save to this browser. Check your storage settings.");
        }
      }}
    >
      <Combobox
        label="Printing"
        value={target}
        onValueChange={setTarget}
        maxVisibleOptions={50}
        options={printings.map((card) => ({
          value: card.id,
          label: card.name + " · " + card.number,
          description: card.id,
          keywords: card.id,
        }))}
      />
      <Select
        label="Field to correct"
        value={field}
        onValueChange={setField}
        options={[
          { value: "artist", label: "Illustrator" },
          { value: "name", label: "Name" },
          { value: "rarity", label: "Rarity" },
          { value: "finish", label: "Finish" },
        ]}
      />
      <DescriptionList items={[{ label: "Current value", value: before }]} />
      <Textarea
        label="Proposed value"
        value={after}
        onChange={(event) => setAfter(event.target.value)}
        required
        maxLength={300}
      />
      <Input
        label="Source URL"
        type="url"
        required
        value={source}
        onChange={(event) => setSource(event.target.value)}
        placeholder="https://…"
        hint="Where can a reviewer verify this change?"
      />
      <Button type="submit" variant="primary">
        Submit correction
      </Button>
      <p role="status" {...stylex.props(s.muted)}>
        {message}
      </p>
    </form>
  );
}
