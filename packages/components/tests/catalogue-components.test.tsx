import { MediaImage } from "../dist/media-image.js";
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Pagination } from "../dist/pagination.js";
import { FilterChip } from "../dist/filter-chip.js";
import { LanguageSelect } from "../dist/language-select.js";
import { CodeBlock } from "../dist/code-block.js";
it("paginates partial last pages and disables both controls for empty data", async () => {
  function Example() {
    const [page, setPage] = useState(1);
    return <Pagination page={page} pageSize={8} total={10} onPageChange={setPage} />;
  }
  const { unmount } = render(<Example />);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("status")).toHaveTextContent("9–10 of 10");
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  unmount();
  render(<Pagination page={1} pageSize={8} total={0} onPageChange={() => {}} />);
  expect(screen.getByRole("status")).toHaveTextContent("No results");
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});
it("removes a filter with the keyboard", async () => {
  const remove = vi.fn();
  render(<FilterChip label="French" onRemove={remove} />);
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(remove).toHaveBeenCalledOnce();
});
it("supports returning to all languages without an invented flag", async () => {
  const change = vi.fn();
  render(<LanguageSelect includeAll value="fr" onValueChange={change} />);
  await userEvent.click(screen.getByRole("combobox"));
  const all = screen.getByRole("option", { name: "All languages" });
  expect(all.querySelector("svg")).toBeNull();
  await userEvent.click(all);
  expect(change).toHaveBeenCalledWith("");
});
it("copies the actual code and handles clipboard denial", async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  render(<CodeBlock code={'{"demo":true}'} />);
  await user.click(screen.getByRole("button", { name: "Copy JSON" }));
  expect(write).toHaveBeenCalledWith('{"demo":true}');
  expect(screen.getByRole("status")).toHaveTextContent("Copied");
  write.mockRejectedValue(new Error("Denied"));
  await user.click(screen.getByRole("button", { name: "Copy JSON" }));
  expect(screen.getByRole("status")).toHaveTextContent("Clipboard unavailable");
});

it("reserves an image fallback and recovers when its source changes", async () => {
  const { rerender } = render(<MediaImage src="/missing.webp" alt="Card photo" />);
  fireEvent.error(screen.getByRole("img", { name: "Card photo" }));
  expect(screen.getByRole("img", { name: "Card photo — image unavailable" })).toBeVisible();
  rerender(<MediaImage src="/available.webp" alt="Card photo" />);
  expect(screen.getByRole("img", { name: "Card photo" })).toHaveAttribute("src", "/available.webp");
});
