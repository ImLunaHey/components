import * as stylex from "@stylexjs/stylex";
import { Button } from "./button";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    paddingBlock: 16,
  },
  status: { color: colors.muted, fontSize: 12 },
  buttons: { display: "flex", gap: 8 },
});
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const current = Math.min(pages, Math.max(1, page));
  return (
    <nav aria-label="Pagination" {...stylex.props(styles.nav)}>
      <span role="status" {...stylex.props(styles.status)}>
        {total === 0
          ? "No results"
          : `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, total)} of ${total} results`}
      </span>
      <div {...stylex.props(styles.buttons)}>
        <Button disabled={current === 1} onClick={() => onPageChange(current - 1)}>
          Previous
        </Button>
        <Button disabled={current === pages} onClick={() => onPageChange(current + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
