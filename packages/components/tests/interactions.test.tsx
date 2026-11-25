import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Select } from "../dist/select.js";
import { LanguageSelect } from "../dist/language-select.js";
import { FileUpload } from "../dist/file-upload.js";
import { DataTable } from "../dist/data-table.js";
import { Dialog } from "../dist/dialog.js";
import { Progress } from "../dist/progress.js";
describe("published React controls", () => {
  it("select supports keyboard selection, disabled options and outside dismissal", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <>
        <Select
          label="Status"
          value="open"
          onValueChange={changed}
          options={[
            { value: "open", label: "Open" },
            { value: "blocked", label: "Blocked", disabled: true },
            { value: "done", label: "Done" },
          ]}
        />
        <p>Outside</p>
      </>,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(changed).toHaveBeenCalledWith("done");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
  it("renders dependency flags and filters languages", async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<LanguageSelect value="en-US" onValueChange={changed} />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox", { name: "Search Language" }), "Japanese");
    const option = screen.getByRole("option", { name: /Japanese/ });
    expect(option.querySelector("svg")).not.toBeNull();
    await user.click(option);
    expect(changed).toHaveBeenCalledWith("ja");
  });
  it("previews mixed attachments and releases object URLs", async () => {
    const create = vi.fn(() => "blob:preview");
    const revoke = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
    const changed = vi.fn();
    const { unmount } = render(<FileUpload multiple onFilesChange={changed} />);
    const documentFile = new File(["text"], "readme.txt", { type: "text/plain" });
    const imageFile = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Attach file"), {
      target: { files: [documentFile, imageFile] },
    });
    expect(await screen.findByAltText("Preview of photo.png")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    expect(screen.queryByAltText("Preview of readme.txt")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove photo.png" }));
    expect(changed).toHaveBeenLastCalledWith([documentFile]);
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("blob:preview"));
    unmount();
  });
  it("rejects oversized files", () => {
    render(<FileUpload maxBytes={1} />);
    fireEvent.change(screen.getByLabelText("Attach file"), {
      target: { files: [new File(["large"], "large.txt")] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Each file must be under");
  });
  it("sorts the TanStack table numerically", async () => {
    render(
      <DataTable
        label="Invoices"
        data={[{ total: 20 }, { total: 3 }]}
        columns={[{ accessorKey: "total", header: "Total" }]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Total" }));
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(screen.getByRole("button", { name: "Total" }));
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("3");
    expect(rows[2]).toHaveTextContent("20");
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
  });
  it("dismisses a modal on backdrop click and native cancel", () => {
    function Example() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog open={open} onOpenChange={setOpen} title="Confirm">
          Content
        </Dialog>
      );
    }
    const { unmount } = render(<Example />);
    let dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
      left: 10,
      right: 110,
      top: 10,
      bottom: 110,
    } as DOMRect);
    fireEvent.pointerDown(dialog, { clientX: 0, clientY: 0 });
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    unmount();
    render(<Example />);
    dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { bubbles: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("shows progress details on focus and hover and dismisses with Escape", () => {
    render(<Progress label="Storage" value={82} detail="82 GB of 100 GB" />);
    const bar = screen.getByRole("progressbar");
    fireEvent.focus(bar);
    expect(screen.getByRole("tooltip")).toHaveTextContent("82 GB of 100 GB");
    fireEvent.keyDown(bar, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.pointerEnter(bar);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerLeave(bar);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});

it("limits large searchable lists while keeping matches keyboard accessible", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Select
      label="Record"
      searchable
      maxVisibleOptions={10}
      value="0"
      onValueChange={changed}
      options={Array.from({ length: 100 }, (_, i) => ({ value: String(i), label: `Record ${i}` }))}
    />,
  );
  await user.click(screen.getByRole("combobox", { name: "Record", exact: true }));
  expect(screen.getAllByRole("option")).toHaveLength(10);
  expect(screen.getByRole("status")).toHaveTextContent("Showing 10 of 100");
  await user.type(screen.getByRole("combobox", { name: "Search Record" }), "99");
  await user.keyboard("{Enter}");
  expect(changed).toHaveBeenCalledWith("99");
});
