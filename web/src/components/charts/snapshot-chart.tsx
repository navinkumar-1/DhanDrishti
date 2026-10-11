"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatInr, formatMonth } from "@/lib/format";
import type { Snapshot, TimelinePoint } from "@/types/domain";

export function SnapshotChart({ points }: { points: Snapshot[] }) {
  const [active, setActive] = useState(points.length - 1);
  const data = points.map((point) => ({ ...point, axis: formatMonth(point.date) }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
          onClick={(state) => {
            if (typeof state?.activeTooltipIndex === "number") setActive(state.activeTooltipIndex);
          }}
        >
          <defs>
            <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A6DFF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#1A6DFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E8EBF0" />
          <XAxis dataKey="axis" tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis
            domain={[0, 1_000_000]}
            ticks={[0, 200000, 400000, 600000, 800000, 1000000]}
            tickFormatter={(value) => (value === 0 ? "₹0" : `₹${value / 100000} L`)}
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
          />
          <Tooltip content={<ValueTooltip />} cursor={{ stroke: "#1A6DFF", strokeDasharray: "4 4" }} />
          <Area
            type="stepAfter"
            dataKey="value"
            stroke="#1A6DFF"
            strokeWidth={2}
            fill="url(#valueFill)"
            activeDot={{ r: 5, fill: "#1A6DFF" }}
            dot={(props) => {
              const { cx, cy, index } = props as { cx?: number; cy?: number; index?: number };
              if (cx === undefined || cy === undefined) return <g />;
              const selected = index === active;
              return <circle cx={cx} cy={cy} r={selected ? 5 : 3} fill={selected ? "#1A6DFF" : "#FFFFFF"} stroke="#1A6DFF" strokeWidth={2} />;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ValueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Snapshot }[];
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-tooltip px-3 py-2 text-white">
      <p className="text-[14px] font-bold">{formatInr(point.value)}</p>
      <p className="text-[11px] text-[#9CA3AF]">Value · {formatDate(point.date)}</p>
    </div>
  );
}

export function UnitsChart({ points }: { points: TimelinePoint[] }) {
  const data = points.map((point) => ({ ...point, axis: formatMonth(point.date), value: point.units }));
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8EBF0" />
          <XAxis dataKey="axis" tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis domain={[0, 25]} ticks={[0, 5, 10, 15, 20, 25]} tickLine={false} axisLine={false} width={32} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <Tooltip content={<UnitsTooltip />} cursor={{ stroke: "#1A6DFF", strokeDasharray: "4 4" }} />
          <Area type="stepAfter" dataKey="value" stroke="#1A6DFF" strokeWidth={2} fill="#1A6DFF14" dot={{ r: 4, fill: "#1A6DFF" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function UnitsTooltip({ active, payload }: { active?: boolean; payload?: { payload: TimelinePoint & { value: number } }[] }) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-tooltip px-3 py-2 text-white">
      <p className="text-[14px] font-bold">{point.units} units</p>
      <p className="text-[11px] text-[#9CA3AF]">{point.label}</p>
    </div>
  );
}
