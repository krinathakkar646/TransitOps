"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, Plus, Phone, ShieldAlert, ShieldCheck, IdCard, Loader2, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { type DriverStatus } from "@/lib/data"
import { cn } from "@/lib/utils"
import { getDrivers, addDriver } from "@/lib/actions/driver-actions"

const filters: (DriverStatus | "All")[] = ["All", "Available", "On Trip", "Suspended"]

interface Driver {
  id: string
  name: string
  licenceNumber: string
  licenceCategory: string
  licenceExpiryDate: string
  phone: string
  safetyScore: number
  status: string
}

function licenceState(expiry: string) {
  const now = new Date("2026-07-12")
  const exp = new Date(expiry)
  const days = Math.round((exp.getTime() - now.getTime()) / 86400000)
  if (days < 0) return { label: "Expired", tone: "text-destructive", warn: true }
  if (days < 90) return { label: `${days}d left`, tone: "text-warning", warn: true }
  return { label: "Valid", tone: "text-success", warn: false }
}

function scoreColor(score: number) {
  if (score >= 90) return "text-success"
  if (score >= 75) return "text-warning"
  return "text-destructive"
}

export default function DriversPage() {
  const [driversList, setDriversList] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<DriverStatus | "All">("All")

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    licenceNumber: "",
    licenceCategory: "Class A",
    licenceExpiryDate: "",
    phone: "",
    safetyScore: "80",
  })

  async function fetchDrivers() {
    try {
      const data = await getDrivers()
      setDriversList(data)
    } catch (e) {
      console.error("Failed to fetch drivers:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const results = useMemo(() => {
    return driversList.filter((d) => {
      const matchesQuery =
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.licenceNumber.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === "All" || d.status === status
      return matchesQuery && matchesStatus
    })
  }, [driversList, query, status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    // Validations
    if (!formData.name || !formData.licenceNumber || !formData.licenceExpiryDate || !formData.phone) {
      setFormError("Please fill out all required fields.")
      return
    }

    setSubmitting(true)
    try {
      await addDriver({
        name: formData.name,
        licenceNumber: formData.licenceNumber,
        licenceCategory: formData.licenceCategory,
        licenceExpiryDate: formData.licenceExpiryDate,
        phone: formData.phone,
        safetyScore: Number(formData.safetyScore) || 80,
      })

      // Reset form
      setFormData({
        name: "",
        licenceNumber: "",
        licenceCategory: "Class A",
        licenceExpiryDate: "",
        phone: "",
        safetyScore: "80",
      })
      setShowModal(false)
      fetchDrivers()
    } catch (error: any) {
      setFormError(error.message || "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Driver Management"
        description="Licence validity, safety scores, and availability"
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Driver</span>
            <span className="sm:hidden">Add</span>
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or licence number"
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                status === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading drivers...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((d) => {
              const lic = licenceState(d.licenceExpiryDate)
              const initials = d.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              return (
                <div key={d.id} className="rounded-xl border border-border bg-card p-4 interactive-card shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{d.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          {d.phone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <IdCard className="size-4" /> Licence
                      </span>
                      <span className="font-mono text-xs">
                        {d.licenceNumber} · {d.licenceCategory}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Expiry</span>
                      <span className={cn("flex items-center gap-1 font-medium", lic.tone)}>
                        {lic.warn ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
                        {new Date(d.licenceExpiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · {lic.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Safety score</span>
                      <span className={cn("font-semibold tabular-nums", scoreColor(d.safetyScore))}>{d.safetyScore}/100</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          d.safetyScore >= 90 ? "bg-success" : d.safetyScore >= 75 ? "bg-warning" : "bg-destructive",
                        )}
                        style={{ width: `${d.safetyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <IdCard className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No drivers found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Add New Driver</h3>
            <p className="text-xs text-muted-foreground mb-4">Register a driver with license and safety stats.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Driver Full Name *</label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Licence Number *</label>
                  <input
                    required
                    placeholder="e.g. DL-48201"
                    value={formData.licenceNumber}
                    onChange={(e) => setFormData({ ...formData, licenceNumber: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Licence Category *</label>
                  <select
                    value={formData.licenceCategory}
                    onChange={(e) => setFormData({ ...formData, licenceCategory: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  >
                    <option value="Class A">Class A (Trucks)</option>
                    <option value="Class B">Class B (Buses)</option>
                    <option value="Class C">Class C (Vans/Cars)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Licence Expiry Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.licenceExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenceExpiryDate: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                  <input
                    required
                    placeholder="e.g. +1 512 555 0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Initial Safety Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="80"
                  value={formData.safetyScore}
                  onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-55"
                >
                  {submitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
