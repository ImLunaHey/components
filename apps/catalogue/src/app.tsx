import { useState, useEffect, useMemo } from "react";
import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Button } from "@imlunahey/components/button";
import { Input } from "@imlunahey/components/input";
import { Panel } from "@imlunahey/components/panel";
import { FileUpload } from "@imlunahey/components/file-upload";
import { DataTable } from "@imlunahey/components/data-table";
import { Badge } from "@imlunahey/components/badge";
import { Progress } from "@imlunahey/components/progress";
import Papa from "papaparse";
import type { ColumnDef } from "@tanstack/react-table";
const items = [
  { id: "media", label: "Media" },
  { id: "import", label: "Import" },
];
interface RecordRow {
  name: string;
  quantity: string;
  price: string;
}
export function App({ view }: { view: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [message, setMessage] = useState("");
  const [imported, setImported] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const next = files
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setImages(next);
    return () => next.forEach((image) => URL.revokeObjectURL(image.url));
  }, [files]);
  const columns = useMemo<ColumnDef<RecordRow>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (info) => (
          <Input
            label={"Quantity for " + info.row.original.name}
            type="number"
            min={0}
            value={info.row.original.quantity}
            onChange={(e) =>
              setRows((current) =>
                current.map((row, index) =>
                  index === info.row.index ? { ...row, quantity: e.target.value } : row,
                ),
              )
            }
          />
        ),
      },
      { accessorKey: "price", header: "Price" },
      {
        id: "validation",
        header: "Validation",
        cell: (info) => (
          <Badge tone={Number(info.row.original.quantity) >= 0 ? "success" : "danger"}>
            {Number(info.row.original.quantity) >= 0 ? "Valid" : "Fix quantity"}
          </Badge>
        ),
      },
    ],
    [],
  );
  function parse(text: string) {
    const result = Papa.parse<RecordRow>(text, { header: true, skipEmptyLines: true });
    if (
      result.errors.length ||
      !["name", "quantity", "price"].every((key) => result.meta.fields?.includes(key))
    ) {
      setMessage("CSV must contain name, quantity and price columns.");
      setRows([]);
      return;
    }
    if (result.data.length > 100) {
      setMessage("Import up to 100 records at a time.");
      setRows([]);
      setImported(false);
      return;
    }
    setRows(result.data);
    setImported(false);
    setMessage("Review the records before importing.");
  }
  const valid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.name.trim() &&
        Number.isInteger(Number(row.quantity)) &&
        Number(row.quantity) >= 0 &&
        Number(row.price) >= 0 &&
        row.price.trim(),
    );
  return (
    <Frame name="Shelf" view={view} items={items}>
      {view === "import" ? (
        <Panel
          title="CSV import"
          description="Upload → validate → import into a local catalogue"
          actions={
            <Button
              onClick={() =>
                parse("name,quantity,price\nBase Set,3,12.50\nJungle,2,8.00\nFossil,1,10.00")
              }
            >
              Load sample
            </Button>
          }
        >
          <FileUpload
            label="Choose a CSV file"
            accept=".csv,text/csv"
            maxBytes={1024 * 1024}
            onFilesChange={async (selected) => {
              if (selected[0]) parse(await selected[0].text());
              else {
                setRows([]);
                setImported(false);
              }
            }}
          />
          {rows.length > 0 && <DataTable label="Import records" data={rows} columns={columns} />}
          <div {...stylex.props(layout.row)}>
            <Button
              variant="primary"
              disabled={!valid || imported}
              onClick={() => {
                localStorage.setItem("shelf-react-catalogue", JSON.stringify(rows));
                setImported(true);
                setMessage(`${rows.length} records imported locally.`);
              }}
            >
              Import records
            </Button>
            <Button
              onClick={() => {
                setRows([]);
                setImported(false);
                setMessage("Import reset.");
              }}
            >
              Reset import
            </Button>
          </div>
          {imported && (
            <Progress
              label="Import complete"
              value={rows.length}
              max={rows.length}
              detail={`${rows.length} records imported`}
              tone="success"
            />
          )}
          <p role="status">{message}</p>
        </Panel>
      ) : (
        <>
          <Panel title="Media library" description="Images stay on this device">
            <FileUpload label="Upload images" accept="image/*" multiple onFilesChange={setFiles} />
            <Input
              label="Search media"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Panel>
          <div {...stylex.props(layout.three)}>
            {images
              .filter((image) => image.name.toLowerCase().includes(search.toLowerCase()))
              .map((image) => (
                <Panel key={image.url} title={image.name}>
                  <img src={image.url} alt={image.name} {...stylex.props(layout.image)} />
                  <Button
                    variant="danger"
                    onClick={() => setFiles(files.filter((file) => file.name !== image.name))}
                  >
                    Delete image
                  </Button>
                </Panel>
              ))}
          </div>
          {!images.length && (
            <p {...stylex.props(layout.muted)}>Choose or drop images to preview your collection.</p>
          )}
        </>
      )}
    </Frame>
  );
}
