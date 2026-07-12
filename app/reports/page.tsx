"use client"

import { useState, useEffect, useMemo } from "react"
import { FileDown, FileText, Fuel, Gauge, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { EfficiencyChart, UtilizationChart, RoiChart } from "@/components/reports/charts"
import { formatCurrency } from "@/lib/utils"
import { getDashboardKpis } from "@/lib/actions/dashboard-actions"

interface Vehicle {
  id: string
  registrationNumber: string
  name: string
  type: string
  status: string
  odometer: number
  acquisitionCost: number
}

interface Trip {
  id: string
  vehicleId: string | null
  revenue: number
  status: string
}

const efficiencyTrend = [
  { month: "Feb", efficiency: 1.8 },
  { month: "Mar", efficiency: 2.1 },
  { month: "Apr", efficiency: 1.6 },
  { month: "May", efficiency: 2.3 },
  { month: "Jun", efficiency: 2.0 },
  { month: "Jul", efficiency: 1.4 },
]

const utilizationByRegion = [
  { region: "West", utilization: 68 },
  { region: "Central", utilization: 82 },
  { region: "East", utilization: 40 },
  { region: "South", utilization: 55 },
]

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      const res = await getDashboardKpis()
      setData(res)
    } catch (e) {
      console.error("Failed to load reports data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const roi = useMemo(() => {
    if (!data) return []
    const vehicles: Vehicle[] = data.vehiclesList || []
    const trips: Trip[] = data.allTripsList || []

    return vehicles
      .filter((v) => v.status !== "Retired")
      .map((v) => {
        const rev = trips
          .filter((t) => t.vehicleId === v.id && t.status === "Completed")
          .reduce((s, t) => s + t.revenue, 0)
        const acquisition = v.acquisitionCost || 1
        const vehicleRoi = ((rev - v.acquisitionCost * 0.02) / acquisition) * 100
        return { name: v.registrationNumber, roi: Number(vehicleRoi.toFixed(1)) }
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 6)
  }, [data])

  function exportCsv() {
    if (!data) return
    const vehicles: Vehicle[] = data.vehiclesList || []
    const rows = [
      ["Registration", "Name", "Type", "Status", "Odometer", "Acquisition Cost"],
      ...vehicles.map((v) => [
        v.registrationNumber,
        v.name,
        v.type,
        v.status,
        String(v.odometer),
        String(v.acquisitionCost),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "routex-fleet-report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading analytics reports...</p>
      </div>
    )
  }

  const k = data

  // Dynamic cost break down
  const fuelPct = k.operationalCost ? Math.round((k.totalFuelCost / k.operationalCost) * 100) : 0
  const maintPct = k.operationalCost ? Math.round((k.totalMaintenance / k.operationalCost) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Fuel efficiency, utilization, operational cost, and ROI"
        action={
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <FileDown className="size-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Fuel Efficiency" value={`${k.fuelEfficiency} km/L`} icon={Fuel} tone="accent" />
        <StatCard label="Fleet Utilization" value={`${k.utilization}%`} icon={Gauge} tone="success" />
        <StatCard label="Operational Cost" value={formatCurrency(k.operationalCost)} icon={DollarSign} tone="warning" />
        <StatCard label="Fleet ROI" value={`${k.roi}%`} icon={TrendingUp} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Fuel Efficiency Trend</h2>
          <p className="text-xs text-muted-foreground">Distance travelled per litre, monthly</p>
          <EfficiencyChart data={efficiencyTrend} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Utilization by Region</h2>
          <p className="text-xs text-muted-foreground">Percentage of fleet actively on trips</p>
          <UtilizationChart data={utilizationByRegion} />
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Vehicle ROI</h2>
        <p className="text-xs text-muted-foreground">Return on investment per vehicle (revenue vs cost)</p>
        <RoiChart data={roi} />
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Cost Breakdown</h2>
        <p className="mb-4 text-xs text-muted-foreground">Where operational spend goes</p>
        <div className="space-y-4">
          <CostRow label="Fuel" value={k.totalFuelCost} total={k.operationalCost} tone="bg-accent" />
          <CostRow label="Maintenance" value={k.totalMaintenance} total={k.operationalCost} tone="bg-primary" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="font-medium">Total revenue (completed trips)</span>
          <span className="font-bold tabular-nums text-success">{formatCurrency(k.totalRevenue)}</span>
        </div>
      </section>
    </div>
  )
}

function CostRow({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: string
}) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {formatCurrency(value)} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
