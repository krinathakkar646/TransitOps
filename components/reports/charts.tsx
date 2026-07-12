"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"

const ORANGE = "#e2691f"
const NAVY = "#2b3a5c"
const GREEN = "#3d9a5f"
const RED = "#c0392b"

export function EfficiencyChart({
  data,
}: {
  data: { month: string; efficiency: number }[]
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="efficiency"
            name="km/L"
            stroke={ORANGE}
            strokeWidth={2.5}
            dot={{ r: 3, fill: ORANGE }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UtilizationChart({
  data,
}: {
  data: { region: string; utilization: number }[]
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" />
          <XAxis dataKey="region" tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Bar dataKey="utilization" name="Utilization %" fill={NAVY} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RoiChart({
  data,
}: {
  data: { name: string; roi: number }[]
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef0f4" />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" unit="%" />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={70}
            stroke="#9aa2b1"
          />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Bar dataKey="roi" name="ROI %" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.roi >= 0 ? GREEN : RED} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
