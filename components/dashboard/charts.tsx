"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

const NAVY = "#2b3a5c"
const ORANGE = "#e2691f"
const GREEN = "#3d9a5f"
const AMBER = "#d9a12b"
const GRAY = "#c3c9d4"

export function FleetStatusChart({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  const colors = [ORANGE, GREEN, AMBER, GRAY]
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => <span style={{ color: "#4b5563" }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 top-[38%] flex -translate-y-1/2 flex-col items-center">
        <span className="text-2xl font-bold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">Vehicles</span>
      </div>
    </div>
  )
}

export function CostChart({
  data,
}: {
  data: { month: string; fuel: number; maintenance: number }[]
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9aa2b1" />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="fuel" name="Fuel" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="maintenance" name="Maintenance" fill={NAVY} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
