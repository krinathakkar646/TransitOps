"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, Plus, Truck, Gauge, Loader2, X } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { type VehicleStatus } from "@/lib/data"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"
import { getVehicles, addVehicle } from "@/lib/actions/vehicle-actions"

const filters: (VehicleStatus | "All")[] = ["All", "Available", "On Trip", "In Shop", "Retired"]

interface Vehicle {
  id: string
  registrationNumber: string
  name: string
  type: string
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  status: string
  region: string
}

export default function VehiclesPage() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<VehicleStatus | "All">("All")
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    registrationNumber: "",
    name: "",
    type: "Truck",
    maxLoadCapacity: "",
    odometer: "",
    acquisitionCost: "",
    region: "",
  })

  async function fetchVehicles() {
    try {
      const data = await getVehicles()
      setVehiclesList(data)
    } catch (e) {
      console.error("Failed to fetch vehicles:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const results = useMemo(() => {
    return vehiclesList.filter((v) => {
      const matchesQuery =
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(query.toLowerCase()) ||
        v.region.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === "All" || v.status === status
      return matchesQuery && matchesStatus
    })
  }, [vehiclesList, query, status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    
    // Validations
    if (!formData.registrationNumber || !formData.name || !formData.region) {
      setFormError("Please fill out all required fields.")
      return
    }

    // Check unique registration number (case-insensitive check in current local state)
    const exists = vehiclesList.some(
      (v) => v.registrationNumber.toLowerCase() === formData.registrationNumber.toLowerCase()
    )
    if (exists) {
      setFormError("A vehicle with this registration number already exists.")
      return
    }

    setSubmitting(true)
    try {
      await addVehicle({
        registrationNumber: formData.registrationNumber,
        name: formData.name,
        type: formData.type,
        maxLoadCapacity: Number(formData.maxLoadCapacity) || 0,
        odometer: Number(formData.odometer) || 0,
        acquisitionCost: Number(formData.acquisitionCost) || 0,
        region: formData.region,
      })
      
      // Reset form
      setFormData({
        registrationNumber: "",
        name: "",
        type: "Truck",
        maxLoadCapacity: "",
        odometer: "",
        acquisitionCost: "",
        region: "",
      })
      setShowModal(false)
      fetchVehicles()
    } catch (error: any) {
      setFormError(error.message || "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        description={`${vehiclesList.length} vehicles across all regions`}
        action={
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Vehicle</span>
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
            placeholder="Search by name, registration, or region"
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
          <p className="mt-2 text-sm text-muted-foreground">Loading registry...</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {results.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card p-4 interactive-card shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Truck className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{v.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{v.registrationNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Detail label="Type" value={v.type} />
                  <Detail label="Region" value={v.region} />
                  <Detail label="Max Load" value={`${formatNumber(v.maxLoadCapacity)} kg`} />
                  <Detail label="Odometer" value={`${formatNumber(v.odometer)} km`} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Max Load</th>
                  <th className="px-4 py-3 font-medium">Odometer</th>
                  <th className="px-4 py-3 font-medium">Acquisition</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <Truck className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{v.registrationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.region}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(v.maxLoadCapacity)} kg</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(v.odometer)} km</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(v.acquisitionCost)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <Gauge className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No vehicles found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Add New Vehicle</h3>
            <p className="text-xs text-muted-foreground mb-4">Register a vehicle to your fleet.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Registration Number *</label>
                  <input
                    required
                    placeholder="e.g. TX-9920"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Vehicle Name *</label>
                  <input
                    required
                    placeholder="e.g. Sprinter Van"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Vehicle Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Region *</label>
                  <input
                    required
                    placeholder="e.g. West, East"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Max Load (kg)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Acquisition (₹)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
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
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
