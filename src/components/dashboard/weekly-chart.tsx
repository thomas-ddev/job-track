"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  CHART_GRIDLINE,
  CHART_MUTED_TEXT,
  CHART_PRIMARY_TEXT,
  CHART_SINGLE_SERIES_COLOR,
  CHART_SURFACE,
} from "@/lib/chart-colors";

const weekLabelFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });

export type WeeklyChartPoint = {
  weekStart: string; // ISO date, sérialisé depuis le Server Component
  count: number;
};

export function WeeklyChart({ data }: { data: WeeklyChartPoint[] }) {
  const chartData = data.map((point) => ({
    label: weekLabelFormatter.format(new Date(point.weekStart)),
    count: point.count,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          {/* Une seule série : pas de légende nécessaire, le titre du
              graphique (hors de ce composant) porte déjà l'information. */}
          <CartesianGrid vertical={false} stroke={CHART_GRIDLINE} strokeDasharray="0" />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_MUTED_TEXT, fontSize: 12 }}
            axisLine={{ stroke: CHART_GRIDLINE }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: CHART_MUTED_TEXT, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: CHART_GRIDLINE, opacity: 0.4 }}
            contentStyle={{
              backgroundColor: CHART_SURFACE,
              border: `1px solid ${CHART_GRIDLINE}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: CHART_PRIMARY_TEXT }}
            itemStyle={{ color: CHART_PRIMARY_TEXT }}
            formatter={(value) => [`${value}`, "Candidatures"]}
          />
          <Bar
            dataKey="count"
            fill={CHART_SINGLE_SERIES_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
