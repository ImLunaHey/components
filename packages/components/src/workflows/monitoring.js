import { defineChart, mountChart, lineY } from "@tanstack/charts";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { $, el, button, picker, message } from "./ui.js";
export function exactRange(from, to) {
  const start = Date.parse(from + "Z"),
    end = Date.parse(to + "Z");
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    throw Error("Choose an end time after the start.");
  if (end - start > 31 * 86400000)
    throw Error("Use a range of 31 days or less.");
  return { start, end };
}
export function telemetry(start, end) {
  return Array.from({ length: 25 }, (_, i) => {
    const time = start + ((end - start) * i) / 24;
    return {
      time,
      cpu: Math.round(
        30 + 14 * Math.sin(time / 200000) + 8 * Math.cos(time / 730000),
      ),
      latency: Math.round(
        90 + 25 * Math.cos(time / 300000) + 10 * Math.sin(time / 80000),
      ),
      id: String(i),
    };
  });
}
export function initMonitoring() {
  let duration = 3600000,
    zone = "UTC",
    refresh = 5000,
    live = true,
    range = { start: Date.now() - 3600000, end: Date.now() },
    timer,
    hosts = [];
  const tools = $("dashboard-time-toolbar");
  const rangeHost = el("div"),
    zoneHost = el("div"),
    refreshHost = el("div");
  const toggle = button("Pause live", () => {
    live = !live;
    if (live) {
      range.end = Date.now();
      range.start = range.end - duration;
    }
    schedule();
    render();
  });
  tools.append(
    rangeHost,
    zoneHost,
    refreshHost,
    toggle,
    button("Refresh now", () => {
      if (live) {
        range.end = Date.now();
        range.start = range.end - duration;
      }
      render();
    }),
  );
  const rangePicker = picker(
    rangeHost,
    "Dashboard time range",
    [
      ["900000", "Last 15 minutes"],
      ["3600000", "Last hour"],
      ["86400000", "Last 24 hours"],
      ["604800000", "Last 7 days"],
      ["custom", "Exact range"],
    ],
    "3600000",
    (v) => {
      if (v === "custom") {
        live = false;
        toggle.textContent = "Resume live";
        schedule();
        $("dashboard-from").focus();
        return;
      }
      duration = Number(v);
      live = true;
      range.end = Date.now();
      range.start = range.end - duration;
      schedule();
      render();
    },
  );
  picker(
    zoneHost,
    "Display timezone",
    [
      ["UTC", "UTC"],
      ["Europe/London", "London"],
      ["America/New_York", "New York"],
      ["Asia/Tokyo", "Tokyo"],
    ],
    "UTC",
    (v) => {
      zone = v;
      render();
    },
  );
  picker(
    refreshHost,
    "Refresh interval",
    [
      ["0", "Manual refresh"],
      ["5000", "Every 5 seconds"],
      ["15000", "Every 15 seconds"],
      ["60000", "Every minute"],
    ],
    "5000",
    (v) => {
      refresh = Number(v);
      schedule();
      render();
    },
  );
  function schedule() {
    clearInterval(timer);
    if (live && refresh)
      timer = setInterval(() => {
        if (document.hidden) return;
        range.end = Date.now();
        range.start = range.end - duration;
        render();
      }, refresh);
  }
  function render() {
    const rows = telemetry(range.start, range.end);
    toggle.textContent = live ? "Pause live" : "Resume live";
    toggle.setAttribute("aria-pressed", String(live));
    const fmt = (t) =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(t));
    for (const [i, id, key, label, color] of [
      [0, "workflow-cpu-chart", "cpu", "CPU load (%)", "var(--info)"],
      [1, "workflow-latency-chart", "latency", "Latency (ms)", "var(--accent)"],
    ]) {
      const options = {
        height: 230,
        ariaLabel: label + " over selected time range",
        definition: defineChart({
          theme: {
            foreground: "var(--foreground)",
            muted: "var(--muted-foreground)",
            grid: "var(--border)",
            background: "transparent",
          },
          keyboard: true,
          marks: [
            lineY(rows, {
              x: "time",
              y: key,
              key: "id",
              stroke: color,
              strokeWidth: 2,
            }),
          ],
          scales: {
            x: {
              scale: scaleLinear,
              domain: [range.start, range.end],
              axis: {
                ticks: { count: 3, format: fmt },
                tickLabels: {
                  fontSize: 10,
                  thin: { minGap: 50, priority: "ends" },
                },
              },
            },
            y: {
              scale: scaleLinear,
              grid: true,
              axis: {
                label,
                ticks: { count: 4 },
                tickLabels: { fontSize: 10 },
              },
            },
          },
          tooltip: {
            use: tooltip,
            format: (p) => fmt(p.datum.time) + " · " + p.datum[key],
          },
        }),
      };
      if (hosts[i]) hosts[i].update(options);
      else hosts[i] = mountChart($(id), options);
      $(id).dataset.engine = "tanstack-charts";
    }
    $("dashboard-from").value = new Date(range.start)
      .toISOString()
      .slice(0, 16);
    $("dashboard-to").value = new Date(range.end).toISOString().slice(0, 16);
    message(
      "dashboard-time-status",
      `${fmt(range.start)} → ${fmt(range.end)} · ${zone} · ${live ? "Live" : "Paused / exact range"} · both charts updated`,
    );
  }
  $("dashboard-absolute").onsubmit = (e) => {
    e.preventDefault();
    try {
      range = exactRange($("dashboard-from").value, $("dashboard-to").value);
      duration = range.end - range.start;
      live = false;
      rangePicker.native.value = "custom";
      rangePicker.native.dispatchEvent(new Event("change"));
      schedule();
      render();
    } catch (error) {
      message("dashboard-time-status", error.message, true);
    }
  };
  render();
  schedule();
  window.addEventListener(
    "pagehide",
    () => {
      clearInterval(timer);
      hosts.forEach((h) => h.destroy?.());
    },
    { once: true },
  );
}
