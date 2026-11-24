import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Button } from "@imlunahey/components/button";
import { Input } from "@imlunahey/components/input";
import { Panel } from "@imlunahey/components/panel";
import { Select } from "@imlunahey/components/select";
import { DataTable } from "@imlunahey/components/data-table";
import { Badge } from "@imlunahey/components/badge";
import { Dialog } from "@imlunahey/components/dialog";
import { LineChart } from "@imlunahey/components/line-chart";
import { Progress } from "@imlunahey/components/progress";
const items = [
  { id: "billing", label: "Billing" },
  { id: "sharing", label: "Sharing" },
  { id: "keys", label: "API keys" },
  { id: "monitoring", label: "Monitoring" },
];
const plans = { Starter: 6, Standard: 18, Performance: 36 };
function downloadInvoice(id: string) {
  const url = URL.createObjectURL(
    new Blob([`SAMPLE INVOICE — NOT A TAX DOCUMENT\n${id}\n£18.00 · Paid\n`], {
      type: "text/plain",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = id + ".txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function App({ view }: { view: string }) {
  const [plan, setPlan] = useState("Standard");
  const [range, setRange] = useState("30");
  const [cycle, setCycle] = useState("monthly");
  const [current, setCurrent] = useState("Standard · monthly");
  const [cancelled, setCancelled] = useState(false);
  const [confirm, setConfirm] = useState<"plan" | "cancel" | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([{ email: "luna@example.com", role: "Owner" }]);
  const [keyName, setKeyName] = useState("");
  const [keys, setKeys] = useState<{ name: string; prefix: string; active: boolean }[]>([]);
  const [secret, setSecret] = useState("");
  return (
    <Frame name="Control" view={view} items={items}>
      {view === "billing" ? (
        <Panel
          title="Subscription & billing"
          actions={
            <Badge tone={cancelled ? "warning" : "success"}>
              {cancelled ? "Cancels at renewal" : "Active"}
            </Badge>
          }
        >
          <div {...stylex.props(layout.grid)}>
            <Panel title="Subscription">
              <Select
                label="Plan"
                value={plan}
                onValueChange={setPlan}
                options={Object.keys(plans).map((value) => ({ value, label: value }))}
              />
              <Select
                label="Billing interval"
                value={cycle}
                onValueChange={setCycle}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual · two months free" },
                ]}
              />
              <strong>
                £{plans[plan as keyof typeof plans] * (cycle === "annual" ? 10 : 1)} /{" "}
                {cycle === "annual" ? "year" : "month"}
              </strong>
              <Button variant="primary" onClick={() => setConfirm("plan")}>
                Review change
              </Button>
              <Button
                variant="danger"
                onClick={() => (cancelled ? setCancelled(false) : setConfirm("cancel"))}
              >
                {cancelled ? "Resume subscription" : "Cancel at renewal"}
              </Button>
              <span {...stylex.props(layout.muted)}>Current: {current}</span>
            </Panel>
            <Panel title="Billing details">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage("Billing details saved locally.");
                }}
                {...stylex.props(layout.stack)}
              >
                <Input
                  label="Billing email"
                  type="email"
                  defaultValue="luna@example.com"
                  required
                />
                <Input label="Company" defaultValue="Luna’s projects" />
                <Select
                  label="Payment method"
                  value="visa"
                  onValueChange={() => {}}
                  options={[{ value: "visa", label: "Demo Visa · ending 4242" }]}
                />
                <Button type="submit">Save details</Button>
              </form>
            </Panel>
          </div>
          <DataTable
            label="Invoices"
            data={[
              { id: "INV-0042", date: "2026-11-01", amount: 18, status: "Paid" },
              { id: "INV-0041", date: "2026-10-01", amount: 18, status: "Paid" },
            ]}
            columns={[
              { accessorKey: "id", header: "Invoice" },
              { accessorKey: "date", header: "Date" },
              {
                accessorKey: "amount",
                header: "Amount",
                cell: (info) => "£" + Number(info.getValue()).toFixed(2),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: (info) => <Badge tone="success">{String(info.getValue())}</Badge>,
              },
              {
                id: "receipt",
                header: "Receipt",
                cell: (info) => (
                  <Button size="small" onClick={() => downloadInvoice(info.row.original.id)}>
                    Download
                  </Button>
                ),
              },
            ]}
          />
        </Panel>
      ) : view === "sharing" ? (
        <Panel title="People with access">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (members.some((m) => m.email === email)) {
                setMessage("This person already has access.");
                return;
              }
              setMembers([...members, { email, role: "Viewer" }]);
              setEmail("");
              setMessage("Demo invitation added.");
            }}
            {...stylex.props(layout.row)}
          >
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit">Invite person</Button>
          </form>
          <DataTable
            label="People with access"
            data={members}
            columns={[
              { accessorKey: "email", header: "Person" },
              { accessorKey: "role", header: "Role" },
              {
                id: "remove",
                header: "Actions",
                cell: (info) =>
                  info.row.original.role !== "Owner" && (
                    <Button
                      size="small"
                      onClick={() =>
                        setMembers(members.filter((m) => m.email !== info.row.original.email))
                      }
                    >
                      Remove
                    </Button>
                  ),
              },
            ]}
          />
        </Panel>
      ) : view === "keys" ? (
        <Panel title="API keys" description="Demo keys have no real access">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = "demo_" + crypto.randomUUID();
              setSecret(value);
              setKeys([...keys, { name: keyName, prefix: value.slice(0, 13) + "…", active: true }]);
              setKeyName("");
            }}
            {...stylex.props(layout.row)}
          >
            <Input
              label="Key name"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
            <Button type="submit">Create demo key</Button>
          </form>
          {secret && (
            <div {...stylex.props(layout.note)}>
              <code>{secret}</code>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(secret);
                  setMessage("Copied");
                }}
              >
                Copy
              </Button>
              <Button onClick={() => setSecret("")}>Done</Button>
            </div>
          )}
          <DataTable
            label="API keys"
            data={keys}
            columns={[
              { accessorKey: "name", header: "Name" },
              { accessorKey: "prefix", header: "Key" },
              {
                accessorKey: "active",
                header: "Status",
                cell: (info) => (
                  <Badge tone={info.getValue() ? "success" : "neutral"}>
                    {info.getValue() ? "Active" : "Revoked"}
                  </Badge>
                ),
              },
              {
                id: "revoke",
                header: "Actions",
                cell: (info) => (
                  <Button
                    disabled={!info.row.original.active}
                    onClick={() =>
                      setKeys(
                        keys.map((k) => (k === info.row.original ? { ...k, active: false } : k)),
                      )
                    }
                  >
                    Revoke
                  </Button>
                ),
              },
            ]}
          />
        </Panel>
      ) : (
        <Panel title="Service monitoring" description="Sample telemetry">
          <LineChart
            label={"CPU load · last " + range + " minutes"}
            values={
              range === "30"
                ? [26, 31, 28, 37, 42, 38, 42]
                : [12, 23, 22, 26, 31, 28, 37, 42, 38, 42]
            }
          />
          <div {...stylex.props(layout.three)}>
            <Progress label="CPU load" value={42} />
            <Progress label="Memory" value={61} />
            <Progress label="Error budget" value={4} max={100} tone="success" />
          </div>
          <Select
            label="Time range"
            value={range}
            onValueChange={setRange}
            options={[
              { value: "30", label: "Last 30 minutes" },
              { value: "60", label: "Last hour" },
            ]}
          />
        </Panel>
      )}
      <p role="status">{message}</p>
      <Dialog
        title={confirm === "plan" ? "Review subscription change" : "Cancel subscription"}
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Keep current plan</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (confirm === "plan") {
                  setCurrent(plan + " · " + cycle);
                  setCancelled(false);
                } else setCancelled(true);
                setConfirm(null);
                setMessage("Subscription updated in this demo.");
              }}
            >
              Confirm change
            </Button>
          </>
        }
      >
        <p>
          {confirm === "plan"
            ? `Change to ${plan}, billed ${cycle}.`
            : "Access remains available until the next renewal."}{" "}
          No charge will be made.
        </p>
      </Dialog>
    </Frame>
  );
}
