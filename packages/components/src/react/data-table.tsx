import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  wrap: {
    overflowX: "auto",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 8,
  },
  table: { borderCollapse: "collapse", width: "100%", fontSize: 12 },
  head: {
    textAlign: "left",
    fontSize: 11,
    fontWeight: 500,
    color: colors.muted,
    backgroundColor: colors.raised,
    paddingBlock: 10,
    paddingInline: 12,
    whiteSpace: "nowrap",
  },
  cell: {
    paddingBlock: 12,
    paddingInline: 12,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.border,
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
  row: { backgroundColor: { default: "transparent", ":hover": colors.hover } },
  sort: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    font: "inherit",
    color: "inherit",
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    padding: 0,
    outline: { default: "none", ":focus-visible": `2px solid ${colors.ring}` },
  },
  empty: { padding: 24, textAlign: "center", color: colors.muted },
  caption: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
  },
});
export function DataTable<T>({
  data,
  columns,
  label,
  empty = "No records found.",
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  label: string;
  empty?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div role="region" aria-label={label} tabIndex={0} {...stylex.props(styles.wrap)}>
      <table data-engine="tanstack-table" {...stylex.props(styles.table)}>
        <caption {...stylex.props(styles.caption)}>{label}</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={
                    header.column.getCanSort()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                  {...stylex.props(styles.head)}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      {...stylex.props(styles.sort)}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown size={12} />
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} {...stylex.props(styles.row)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} {...stylex.props(styles.cell)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td colSpan={columns.length} {...stylex.props(styles.empty)}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
