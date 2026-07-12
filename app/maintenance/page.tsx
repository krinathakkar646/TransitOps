"use client"

import { useMemo, useState, useEffect } from "react"
import { Plus, Wrench, Calendar, CheckCircle2, Loader2, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { type MaintenanceStatus } from "@/lib/data"
import { formatCurrency, cn } from "@/lib/utils"
import { getMaintenanceLogs, logMaintenance, closeMaintenance } from "@/lib/actions/maintenance-actions"
import { getVehicles } from "@/lib/actions/vehicle-actions"

const tabs: (MaintenanceStatus | "All")[] = ["All", "Active", "Closed"]

interface Vehicle {
  id: string
  registrationNumber: string
  name: string
  status: string
}

interface MaintenanceLog {
  id: string
  vehicleId: string | null
  description: string
  cost: number
  startDate: string
  endDate: string | null
  status: string
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<MaintenanceStatus | "All">("All")
  
  // Modals state
  const [showLogModal, setShowLogModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [activeLogForClosing, setActiveLogForClosing] = useState<MaintenanceLog | null>(null)

  // Log Form state
  const [logSubmitting, setLogSubmitting] = useState(false)
  const [logError, setLogError] = useState("")
  const [logForm, setLogForm] = useState({
    vehicleId: "",
    description: "",
    cost: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  // Close Form state
  const [closeSubmitting, setCloseSubmitting] = useState(false)
  const [closeError, setCloseError] = useState("")
  const [closeForm, setCloseForm] = useState({
    cost: "",
    endDate: new Date().toISOString().split("T")[0],
  })

  async function loadData() {
    try {
      const [logsData, vehiclesData] = await Promise.all([
        getMaintenanceLogs(),
        getVehicles(),
      ])
      setLogs(logsData)
      setVehiclesList(vehiclesData)
    } catch (e) {
      console.error("Failed to load maintenance data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const results = useMemo(
    () => (tab === "All" ? logs : logs.filter((l) => l.status === tab)),
    [logs, tab],
  )

  const activeCount = useMemo(
    () => logs.filter((l) => l.status === "Active").length,
    [logs]
  )
  
  const totalCost = useMemo(
    () => logs.reduce((s, l) => s + l.cost, 0),
    [logs]
  )

  // Selectable vehicles for maintenance (any non-retired vehicle)
  const selectableVehicles = useMemo(() => {
    return vehiclesList.filter((v) => v.status !== "Retired")
  }, [vehiclesList])

  async function handleLogMaintenance(e: React.FormEvent) {
    e.preventDefault()
    setLogError("")

    if (!logForm.vehicleId || !logForm.description || !logForm.startDate) {
      setLogError("Please fill out all required fields.")
      return
    }

    setLogSubmitting(true)
    try {
      await logMaintenance({
        vehicleId: logForm.vehicleId,
        description: logForm.description,
        cost: Number(logForm.cost) || 0,
        startDate: logForm.startDate,
      })

      // Reset
      setLogForm({
        vehicleId: "",
        description: "",
        cost: "",
        startDate: new Date().toISOString().split("T")[0],
      })
      setShowLogModal(false)
      loadData()
    } catch (err: any) {
      setLogError(err.message || "Failed to log maintenance")
    } finally {
      setLogSubmitting(false)
    }
  }

  function openCloseModal(log: MaintenanceLog) {
    setActiveLogForClosing(log)
    setCloseForm({
      cost: String(log.cost),
      endDate: new Date().toISOString().split("T")[0],
    })
    setCloseError("")
    setShowCloseModal(true)
  }

  async function handleCloseMaintenance(e: React.FormEvent) {
    e.preventDefault()
    setCloseError("")
    if (!activeLogForClosing) return

    const costVal = Number(closeForm.cost) || 0
    if (!closeForm.endDate) {
      setCloseError("End date is required.")
      return
    }

    setCloseSubmitting(true)
    try {
      await closeMaintenance(
        activeLogForClosing.id,
        costVal,
        closeForm.endDate
      )
      setShowCloseModal(false)
      setActiveLogForClosing(null)
      loadData()
    } catch (err: any) {
      setCloseError(err.message || "Failed to close maintenance")
    } finally {
      setCloseSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Active maintenance removes vehicles from dispatch availability"
        action={
          <button 
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Log Maintenance</span>
            <span className="sm:hidden">Log</span>
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Active Jobs" value={activeCount} icon={Wrench} tone="warning" sub="vehicles in shop" />
        <StatCard label="Total Records" value={logs.length} icon={Calendar} sub="all time" />
        <StatCard label="Total Cost" value={formatCurrency(totalCost)} icon={CheckCircle2} tone="accent" sub="parts + labour" />
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              tab === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading maintenance logs...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {results.map((l) => {
              const v = vehiclesList.find((x) => x.id === l.vehicleId)
              return (
                <div key={l.id} className="rounded-xl border border-border bg-card p-4 interactive-card shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          l.status === "Active" ? "bg-warning/15 text-warning" : "bg-success/10 text-success",
                        )}
                      >
                        <Wrench className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{v?.name ?? "Unknown Vehicle"}</p>
                        <p className="font-mono text-xs text-muted-foreground">{v?.registrationNumber ?? "N/A"}</p>
                      </div>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>

                  <p className="mt-3 text-sm">{l.description}</p>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">
                      {new Date(l.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {l.endDate
                        ? ` – ${new Date(l.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : " – ongoing"}
                    </span>
                    <span className="font-semibold tabular-nums">{formatCurrency(l.cost)}</span>
                  </div>

                  {l.status === "Active" && (
                    <button
                      onClick={() => openCloseModal(l)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition-colors hover:opacity-90"
                    >
                      <CheckCircle2 className="size-3.5" /> Close & restore to Available
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <Wrench className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No records found</p>
            </div>
          )}
        </>
      )}

      {/* Log Maintenance Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Log Maintenance</h3>
            <p className="text-xs text-muted-foreground mb-4">Start active maintenance on a vehicle.</p>

            <form onSubmit={handleLogMaintenance} className="space-y-3.5">
              {logError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {logError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Select Vehicle *</label>
                <select
                  required
                  value={logForm.vehicleId}
                  onChange={(e) => setLogForm({ ...logForm, vehicleId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">Choose a vehicle</option>
                  {selectableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber}) · Status: {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description / Notes *</label>
                <textarea
                  required
                  placeholder="e.g. Brake replacement & transmission diagnostic"
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  className="w-full h-20 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Initial Cost Est. (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={logForm.cost}
                    onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={logForm.startDate}
                    onChange={(e) => setLogForm({ ...logForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-55"
                >
                  {logSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Log job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Maintenance Modal */}
      {showCloseModal && activeLogForClosing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowCloseModal(false)
                setActiveLogForClosing(null)
              }}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Close Maintenance Record</h3>
            <p className="text-xs text-muted-foreground mb-4">Complete maintenance and return vehicle to Available status.</p>

            <form onSubmit={handleCloseMaintenance} className="space-y-3.5">
              {closeError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {closeError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Final Maintenance Cost (₹) *</label>
                <input
                  required
                  type="number"
                  placeholder="Final cost"
                  value={closeForm.cost}
                  onChange={(e) => setCloseForm({ ...closeForm, cost: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">End Date *</label>
                <input
                  required
                  type="date"
                  value={closeForm.endDate}
                  onChange={(e) => setCloseForm({ ...closeForm, endDate: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false)
                    setActiveLogForClosing(null)
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closeSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-success px-4 py-2 text-sm font-semibold text-success-foreground hover:opacity-90 disabled:opacity-55"
                >
                  {closeSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Close Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
