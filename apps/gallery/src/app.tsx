import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Button } from "@imlunahey/components/button";
import { Input } from "@imlunahey/components/input";
import { Textarea } from "@imlunahey/components/textarea";
import { Panel } from "@imlunahey/components/panel";
import { Badge } from "@imlunahey/components/badge";
import { Select } from "@imlunahey/components/select";
import { Combobox } from "@imlunahey/components/combobox";
import { LanguageSelect } from "@imlunahey/components/language-select";
import { FileUpload } from "@imlunahey/components/file-upload";
import { DataTable } from "@imlunahey/components/data-table";
import { Dialog } from "@imlunahey/components/dialog";
import { Progress } from "@imlunahey/components/progress";
import { Tabs } from "@imlunahey/components/tabs";
import { Toggle } from "@imlunahey/components/toggle";
import { QRCode } from "@imlunahey/components/qr-code";
const items = [
  { id: "components", label: "Components" },
  { id: "forms", label: "Forms" },
  { id: "data", label: "Data" },
  { id: "interactions", label: "Interactions" },
];
export function App({ view }: { view: string }) {
  const [status, setStatus] = useState("active");
  const [language, setLanguage] = useState("en-US");
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [tab, setTab] = useState("day");
  const [url, setUrl] = useState("https://github.com/ImLunaHey/components");
  const [feedback, setFeedback] = useState("");
  return (
    <Frame name="Components" view={view} items={items}>
      <div {...stylex.props(layout.grid)}>
        {view === "components" && (
          <>
            <Panel title="Buttons" description="Default, primary, destructive and disabled states">
              <div {...stylex.props(layout.row)}>
                <Button onClick={() => setFeedback("Saved")}>Save changes</Button>
                <Button variant="primary" onClick={() => setFeedback("Approved")}>
                  Approve
                </Button>
                <Button variant="danger" onClick={() => setOpen(true)}>
                  Delete item
                </Button>
                <Button disabled>Unavailable</Button>
              </div>
              <p role="status">{feedback}</p>
            </Panel>
            <Panel title="Status badges">
              <div {...stylex.props(layout.row)}>
                <Badge tone="success">Online</Badge>
                <Badge tone="info">In progress</Badge>
                <Badge tone="warning">Needs review</Badge>
                <Badge tone="danger">Failed</Badge>
              </div>
            </Panel>
            <Panel title="Cards and panels" description="Shared surface, border and spacing tokens">
              <strong>Production API</strong>
              <div {...stylex.props(layout.metric)}>99.98%</div>
              <Progress label="Availability" value={99.98} detail="Last 30 days" />
            </Panel>
            <Panel title="Preferences">
              <Toggle label="Email notifications" checked={enabled} onCheckedChange={setEnabled} />
              <Tabs
                label="Time window"
                items={["day", "week", "month"].map((value) => ({ value, label: value }))}
                value={tab}
                onValueChange={setTab}
              />
            </Panel>
          </>
        )}
        {view === "forms" && (
          <>
            <Panel title="Form fields">
              <Input label="Project name" placeholder="My project" />
              <Input label="Email" type="email" placeholder="you@example.com" />
              <Input label="Validation state" error="A project name is required." />
              <Textarea label="Description" placeholder="What are you building?" />
            </Panel>
            <Panel title="Custom selects and comboboxes">
              <Select
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                  { value: "archived", label: "Archived", disabled: true },
                ]}
                value={status}
                onValueChange={setStatus}
              />
              <Combobox
                label="Environment"
                options={[
                  { value: "active", label: "Production", description: "Live traffic" },
                  { value: "paused", label: "Preview", description: "Pull requests" },
                ]}
                value={status}
                onValueChange={setStatus}
              />
              <LanguageSelect value={language} onValueChange={setLanguage} />
            </Panel>
            <Panel title="Attachments" description="Image previews, validation and removal">
              <FileUpload multiple />
            </Panel>
          </>
        )}
        {view === "data" && (
          <>
            <Panel title="TanStack Table">
              <DataTable
                label="Projects"
                data={[
                  { name: "Fleet Monitor", status: "Active", members: 4 },
                  { name: "Cardlattice", status: "Paused", members: 2 },
                  { name: "Components", status: "Active", members: 1 },
                ]}
                columns={[
                  { accessorKey: "name", header: "Project" },
                  {
                    accessorKey: "status",
                    header: "Status",
                    cell: (info) => (
                      <Badge tone={info.getValue() === "Active" ? "success" : "warning"}>
                        {String(info.getValue())}
                      </Badge>
                    ),
                  },
                  { accessorKey: "members", header: "Members" },
                ]}
              />
            </Panel>
            <Panel title="Progress with tooltips">
              <Progress
                label="Catalogue coverage"
                value={3}
                max={6}
                detail="3 of 6 sets complete"
              />
              <Progress label="Storage" value={99} tone="danger" detail="4.5 GiB free" />
            </Panel>
            <Panel title="QR code">
              <Input label="URL or text" value={url} onChange={(e) => setUrl(e.target.value)} />
              <QRCode value={url || " "} label="QR code for the entered value" />
            </Panel>
          </>
        )}
        {view === "interactions" && (
          <>
            <Panel title="Modal dialog" description="Escape, backdrop dismissal, focus restoration">
              <Button onClick={() => setOpen(true)}>Open dialog</Button>
            </Panel>
            <Panel title="Theme and state">
              <Toggle
                label="Enable background sync"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Progress
                label="Sync progress"
                value={enabled ? 72 : 0}
                detail={enabled ? "72 of 100 items" : "Paused"}
              />
            </Panel>
          </>
        )}
      </div>
      <Dialog
        title="Confirm action"
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setOpen(false);
                setFeedback("Action confirmed");
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p>This action is local to the component demo.</p>
      </Dialog>
    </Frame>
  );
}
