import * as stylex from "@stylexjs/stylex";
import { Frame } from "../../../src/demos/frame";
import { layout } from "../../../src/demos/layout";
import { Panel } from "@imlunahey/components/panel";
import { Badge } from "@imlunahey/components/badge";
import { Progress } from "@imlunahey/components/progress";
import { DataTable } from "@imlunahey/components/data-table";
import { LineChart } from "@imlunahey/components/line-chart";
const machines = [
  {
    name: "tower",
    cpu: 0.4,
    memory: "11.4 / 30.4 GiB",
    temp: 37,
    disk: 4,
    model: "AMD Ryzen 7 9700X",
    gpu: "RTX 5070 Ti · 0% · 34°C",
    ip: "10.0.0.161",
  },
  {
    name: "nova",
    cpu: 20.7,
    memory: "4.9 / 15.4 GiB",
    temp: 50,
    disk: 40,
    model: "Intel N100",
    gpu: "Intel UHD · 0%",
    ip: "10.0.0.178",
  },
  {
    name: "pulsar",
    cpu: 8,
    memory: "10.5 / 16.0 GiB",
    temp: 33,
    disk: 82,
    model: "Apple M4",
    gpu: "Apple M4 GPU · 16% · 31°C",
    ip: "10.0.0.107",
  },
  {
    name: "comet",
    cpu: 50.2,
    memory: "19.3 / 32.0 GiB",
    temp: 80,
    disk: 99,
    model: "Apple M2 Pro",
    gpu: "Apple M2 Pro GPU · 25% · 70°C",
    ip: "10.0.0.21",
  },
];
const drives = [
  {
    port: 1,
    device: "sdb",
    id: "WD-WXB2D36HVTNA",
    state: "Online",
    size: "1.8 TiB",
    temp: 32,
    read: "164.8 KiB",
    write: "8.3 MiB",
    iops: 199,
    busy: "61%",
    errors: "0/0/0",
  },
  {
    port: 2,
    device: "—",
    id: "JP2930HQ3NW7WH",
    state: "Missing",
    size: "—",
    temp: 0,
    read: "—",
    write: "—",
    iops: 0,
    busy: "—",
    errors: "—",
  },
  ...["sda", "sdg", "sdd", "sdf", "sde"].map((device, index) => ({
    port: index + 3,
    device,
    id: ["WD-WXB2D36HVT23", "9595N05NS", "WD-WXB2D36HV3J4", "WD-WXB2D36DNCA4", "WD-WX12D462V2CD"][
      index
    ]!,
    state: "Online",
    size: "1.8 TiB",
    temp: 32 + index,
    read: "171.2 KiB",
    write: "8.3 MiB",
    iops: 220 + index,
    busy: "66%",
    errors: "0/0/0",
  })),
];
const styles = stylex.create({
  fleet: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0,2fr) minmax(0,1.2fr)",
      "@media (max-width: 1100px)": "minmax(0,1fr)",
    },
    gap: 16,
    alignItems: "stretch",
  },
  machines: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2,minmax(0,1fr))",
      "@media (max-width: 720px)": "minmax(0,1fr)",
    },
    gap: 16,
  },
  stats: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 },
  value: { fontSize: 21, fontWeight: 550, fontVariantNumeric: "tabular-nums" },
  mini: { fontSize: 11, opacity: 0.65 },
  spaced: { display: "grid", gap: 16, alignContent: "start" },
});
export function App({ view }: { view: string }) {
  return (
    <Frame name="Fleet Monitor" view={view} items={[{ id: "overview", label: "Overview" }]}>
      <div {...stylex.props(layout.three)}>
        <Panel title="Cloud Gateway Fiber" actions={<Badge tone="success">Online</Badge>}>
          <strong>19 connected clients</strong>
          <span>↓ 2.67 MiB/s · ↑ 92.7 KiB/s</span>
        </Panel>
        <Panel title="USW Pro XG 8 PoE" actions={<Badge tone="success">Online</Badge>}>
          <strong>8 / 10 ports up</strong>
          <span>PoE 17.6 / 150 W</span>
        </Panel>
        <Panel title="U7 Pro XGS" actions={<Badge tone="success">Online</Badge>}>
          <strong>10 wireless clients</strong>
          <span>2.4 GHz · 5 GHz · 6 GHz</span>
        </Panel>
      </div>
      <div {...stylex.props(styles.fleet)}>
        <div {...stylex.props(styles.machines)}>
          {machines.map((machine) => (
            <Panel
              key={machine.name}
              title={machine.name}
              description={machine.model}
              actions={<Badge tone="success">Online</Badge>}
            >
              <div {...stylex.props(styles.stats)}>
                <div>
                  <div {...stylex.props(styles.value)}>{machine.cpu}%</div>
                  <div {...stylex.props(styles.mini)}>CPU usage</div>
                </div>
                <div>
                  <div {...stylex.props(styles.value)}>{machine.temp}°C</div>
                  <div {...stylex.props(styles.mini)}>CPU temperature</div>
                </div>
                <div>
                  <strong>{machine.memory}</strong>
                  <div {...stylex.props(styles.mini)}>Memory used</div>
                </div>
              </div>
              <LineChart
                label="CPU load"
                values={Array.from({ length: 12 }, (_, i) =>
                  Math.max(0, machine.cpu + Math.sin(i) * 3),
                )}
                height={130}
              />
              <div {...stylex.props(styles.mini)}>{machine.gpu}</div>
              <Progress
                label="Disk used"
                value={machine.disk}
                detail={machine.disk === 99 ? "4.5 GiB free" : "Capacity usage"}
                tone={machine.disk > 95 ? "danger" : "info"}
              />
              <span {...stylex.props(styles.mini)}>{machine.ip}</span>
            </Panel>
          ))}
        </div>
        <Panel
          title="lake"
          description="AMD Ryzen 7 PRO 8845HS · Radeon 780M"
          actions={<Badge tone="warning">ZFS degraded</Badge>}
        >
          <div {...stylex.props(styles.stats)}>
            <div>
              <div {...stylex.props(styles.value)}>36.5%</div>
              <div {...stylex.props(styles.mini)}>CPU usage</div>
            </div>
            <div>
              <div {...stylex.props(styles.value)}>74°C</div>
              <div {...stylex.props(styles.mini)}>CPU temperature</div>
            </div>
            <div>
              <strong>44.4 / 60.6 GiB</strong>
              <div {...stylex.props(styles.mini)}>Memory used</div>
            </div>
          </div>
          <LineChart
            label="CPU load"
            values={[35, 34, 36, 37, 36, 35, 38, 36, 35, 36, 37, 36]}
            height={130}
          />
          <Progress label="Resilver" value={97.4} detail="24.9 MiB/s · about 1h 32m remaining" />
          <Badge tone="warning">6 online · 1 unavailable · 0 I/O errors</Badge>
          <DataTable
            label="Drives: live activity and health"
            data={drives}
            columns={Object.keys(drives[0]!).map((key) => ({
              accessorKey: key,
              header: (
                {
                  port: "Port",
                  device: "Device",
                  id: "Drive ID",
                  state: "State",
                  size: "Size",
                  temp: "°C",
                  read: "Read/s",
                  write: "Write/s",
                  iops: "IOPS",
                  busy: "Busy",
                  errors: "R/W/CRC",
                } as Record<string, string>
              )[key],
            }))}
          />
          <DataTable
            label="Datasets"
            data={[
              { name: "storage", used: "3.4 TiB / 3.5 TiB", free: "118.3 GiB" },
              { name: "storage/lancache", used: "21.8 GiB / 140.1 GiB", free: "118.3 GiB" },
              { name: "storage/timemachine", used: "239.8 KiB / 118.3 GiB", free: "118.3 GiB" },
            ]}
            columns={[
              { accessorKey: "name", header: "Dataset" },
              { accessorKey: "used", header: "Used / total" },
              { accessorKey: "free", header: "Free" },
            ]}
          />
        </Panel>
      </div>
    </Frame>
  );
}
