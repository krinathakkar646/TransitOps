import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  UserCheck,
  Gauge,
  Fuel,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { FleetStatusChart, CostChart } from "@/components/dashboard/charts"
import { formatCurrency } from "@/lib/utils"
import { getDashboardKpis } from "@/lib/actions/dashboard-actions"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const k = await getDashboardKpis()

  const costTrend = [
    { month: "Feb", fuel: 3200, maintenance: 1800 },
    { month: "Mar", fuel: 3600, maintenance: 900 },
    { month: "Apr", fuel: 4100, maintenance: 2400 },
    { month: "May", fuel: 3800, maintenance: 1200 },
    { month: "Jun", fuel: 4300, maintenance: 1470 },
    { month: "Jul", fuel: k.totalFuelCost, maintenance: k.totalMaintenance },
  ]

  return (
    <div>
      <PageHeader
        title="Fleet Dashboard"
        description="Live operational overview across your entire fleet."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Vehicles" value={k.activeVehicles} icon={Truck} tone="accent" sub="on trip now" />
        <StatCard label="Available" value={k.availableVehicles} icon={CheckCircle2} tone="success" sub="ready to dispatch" />
        <StatCard label="In Maintenance" value={k.inShop} icon={Wrench} tone="warning" sub="in shop" />
        <StatCard label="Active Trips" value={k.activeTrips} icon={Route} sub="dispatched" />
        <StatCard label="Pending Trips" value={k.pendingTrips} icon={Clock} sub="drafts" />
        <StatCard label="Drivers On Duty" value={k.driversOnDuty} icon={UserCheck} tone="accent" sub="currently driving" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Fleet Utilization" value={`${k.utilization}%`} icon={Gauge} tone="accent" sub="vehicles on trip" />
        <StatCard label="Fuel Efficiency" value={`${k.fuelEfficiency}`} icon={Fuel} tone="success" sub="km per litre" />
        <StatCard label="Operational Cost" value={formatCurrency(k.operationalCost)} icon={DollarSign} tone="warning" sub="fuel + maintenance" />
        <StatCard label="Fleet ROI" value={`${k.roi}%`} icon={TrendingUp} sub="revenue vs cost" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold">Fleet Status</h2>
          <p className="text-xs text-muted-foreground">Distribution by vehicle state</p>
          <FleetStatusChart data={k.statusCounts} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Operational Costs</h2>
          <p className="text-xs text-muted-foreground">Fuel vs maintenance, last 6 months</p>
          <CostChart data={costTrend} />
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Recent Trips</h2>
            <p className="text-xs text-muted-foreground">Latest dispatch activity</p>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {k.recentTrips.map((t) => {
            const v = k.vehiclesList.find((x) => x.id === t.vehicleId)
            const d = k.driversList.find((x) => x.id === t.driverId)
            return (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Route className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t.source} <span className="text-muted-foreground">→</span> {t.destination}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {v?.registrationNumber ?? "No vehicle"} · {d?.name ?? "No driver"}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(t.revenue)}</p>
                  <p className="text-xs text-muted-foreground">{t.plannedDistance} km</p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
