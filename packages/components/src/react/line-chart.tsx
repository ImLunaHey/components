import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useMemo } from "react";
import { defineChart, mountChart, lineY } from "@tanstack/charts";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { colors } from "./tokens.stylex";
const styles = stylex.create({
  figure: { margin: 0, minWidth: 0 },
  chart: { width: "100%", minWidth: 0, color: colors.muted },
  fallback: { fontSize: 11, color: colors.muted },
});
export function LineChart({
  label,
  values,
  height = 160,
}: {
  label: string;
  values: number[];
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const data = useMemo(() => values.map((value, index) => ({ index, value })), [values]);
  useEffect(() => {
    if (!host.current) return;
    const chart = mountChart(host.current, {
      height,
      ariaLabel: label,
      definition: defineChart({
        keyboard: true,
        marks: [lineY(data, { x: "index", y: "value", stroke: "#89b9ed", strokeWidth: 2 })],
        scales: {
          x: { scale: scaleLinear, axis: { ticks: { count: 3 } } },
          y: { scale: scaleLinear, grid: true, axis: { ticks: { count: 3 } } },
        },
        theme: { foreground: "#a5a5a5", muted: "#888", grid: "#8883", background: "transparent" },
        tooltip: { use: tooltip, format: (point: unknown) => String(point) },
      }),
    });
    return () => chart.destroy();
  }, [data, height, label]);
  return (
    <figure aria-label={label} {...stylex.props(styles.figure)}>
      <div ref={host} data-engine="tanstack-charts" {...stylex.props(styles.chart)} />
      <figcaption {...stylex.props(styles.fallback)}>
        {label} · latest {values.at(-1) ?? 0}
      </figcaption>
    </figure>
  );
}
