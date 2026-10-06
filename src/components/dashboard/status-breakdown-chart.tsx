"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { STATUS_LABELS, STATUS_ORDER } from "@/lib/application-status";
import { CHART_MUTED_TEXT, CHART_PRIMARY_TEXT, STATUS_CHART_COLORS } from "@/lib/chart-colors";
import type { ApplicationStatus } from "@/generated/prisma";

export function StatusBreakdownChart({
  breakdown,
}: {
  breakdown: Record<ApplicationStatus, number>;
}) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: breakdown[status],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
          barCategoryGap="25%"
        >
          <XAxis type="number" hide allowDecimals={false} />
          {/* Chaque catégorie est nommée directement sur l'axe : l'identité
              ne repose donc jamais uniquement sur la couleur (exigence de la
              skill dataviz quand le ΔE CVD d'une paire adjacente est dans la
              zone 6–8, cas du jaune/aqua ici). */}
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: CHART_MUTED_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: CHART_PRIMARY_TEXT, fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
