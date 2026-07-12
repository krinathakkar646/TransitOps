"use client"

import { useMemo, useState, useEffect } from "react"
import { Plus, MapPin, Truck, User, Package, Send, CheckCircle2, XCircle, Route, Loader2, X, DollarSign } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { type TripStatus } from "@/lib/data"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from "@/lib/actions/trip-actions"
import { getVehicles } from "@/lib/actions/vehicle-actions"
import { getDrivers } from "@/lib/actions/driver-actions"

const tabs: (TripStatus | "All")[] = ["All", "Draft", "Dispatched", "Completed", "Cancelled"]

interface Vehicle {
  id: string
  registrationNumber: string
  name: string
  type: string
  maxLoadCapacity: number
  odometer: number
  status: string
}

interface Driver {
  id: string
  name: string
  status: string
  licenceExpiryDate: string
}

interface Trip {
  id: string
  source: string
  destination: string
  vehicleId: string | null
  driverId: string | null
  cargoWeight: number
  plannedDistance: number
  actualDistance: number | null
  revenue: number
  status: string
  date: string
}

export default function TripsPage() {
  const [tripsList, setTripsList] = useState<Trip[]>([])
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([])
  const [driversList, setDriversList] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TripStatus | "All">("All")
  
  // Actions loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Modals state
  const [showNewTripModal, setShowNewTripModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [activeTripForCompletion, setActiveTripForCompletion] = useState<Trip | null>(null)
  
  // New Trip form state
  const [newTripSubmitting, setNewTripSubmitting] = useState(false)
  const [newTripError, setNewTripError] = useState("")
  const [newTripForm, setNewTripForm] = useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
    plannedDistance: "",
    revenue: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Complete Trip form state
  const [completeSubmitting, setCompleteSubmitting] = useState(false)
  const [completeError, setCompleteError] = useState("")
  const [completeForm, setCompleteForm] = useState({
    actualDistance: "",
    revenue: "",
    fuelCost: "",
    fuelLitres: "",
    newOdometer: "",
  })

  async function loadData() {
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        getTrips(),
        getVehicles(),
        getDrivers(),
      ])
      setTripsList(tripsData)
      setVehiclesList(vehiclesData)
      setDriversList(driversData)
    } catch (e) {
      console.error("Failed to fetch trips page data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const results = useMemo(
    () => (tab === "All" ? tripsList : tripsList.filter((t) => t.status === tab)),
    [tripsList, tab],
  )

  const selectedVehicle = useMemo(() => {
    return vehiclesList.find((v) => v.id === newTripForm.vehicleId)
  }, [vehiclesList, newTripForm.vehicleId])

  // Lists of available resources
  const availableVehicles = useMemo(() => {
    return vehiclesList.filter((v) => v.status === "Available")
  }, [vehiclesList])

  const availableDrivers = useMemo(() => {
    return driversList.filter((d) => {
      // Driver must be Available, safety status and has valid licence
      const now = new Date("2026-07-12")
      const expiry = new Date(d.licenceExpiryDate)
      const validLicense = expiry.getTime() > now.getTime()
      return d.status === "Available" && validLicense
    })
  }, [driversList])

  const cargoOverlimit = useMemo(() => {
    if (!selectedVehicle) return false
    const weight = Number(newTripForm.cargoWeight) || 0
    return weight > selectedVehicle.maxLoadCapacity
  }, [selectedVehicle, newTripForm.cargoWeight])

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault()
    setNewTripError("")

    if (!newTripForm.source || !newTripForm.destination || !newTripForm.vehicleId || !newTripForm.driverId) {
      setNewTripError("Please fill out all required fields.")
      return
    }

    if (cargoOverlimit) {
      setNewTripError("Cargo weight exceeds selected vehicle's capacity.")
      return
    }

    setNewTripSubmitting(true)
    try {
      await createTrip({
        source: newTripForm.source,
        destination: newTripForm.destination,
        vehicleId: newTripForm.vehicleId,
        driverId: newTripForm.driverId,
        cargoWeight: Number(newTripForm.cargoWeight) || 0,
        plannedDistance: Number(newTripForm.plannedDistance) || 0,
        revenue: Number(newTripForm.revenue) || 0,
        date: newTripForm.date,
      })

      // Reset
      setNewTripForm({
        source: "",
        destination: "",
        vehicleId: "",
        driverId: "",
        cargoWeight: "",
        plannedDistance: "",
        revenue: "",
        date: new Date().toISOString().split("T")[0],
      })
      setShowNewTripModal(false)
      loadData()
    } catch (err: any) {
      setNewTripError(err.message || "Failed to create trip")
    } finally {
      setNewTripSubmitting(false)
    }
  }

  async function handleDispatch(id: string) {
    setActionLoadingId(id)
    try {
      await dispatchTrip(id)
      loadData()
    } catch (e: any) {
      alert(e.message || "Dispatch failed")
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleCancel(id: string) {
    setActionLoadingId(id)
    try {
      await cancelTrip(id)
      loadData()
    } catch (e: any) {
      alert(e.message || "Cancellation failed")
    } finally {
      setActionLoadingId(null)
    }
  }

  function openCompleteModal(trip: Trip) {
    setActiveTripForCompletion(trip)
    const vehicle = vehiclesList.find((v) => v.id === trip.vehicleId)
    setCompleteForm({
      actualDistance: String(trip.plannedDistance),
      revenue: String(trip.revenue),
      fuelCost: "80",
      fuelLitres: "50",
      newOdometer: vehicle ? String(vehicle.odometer + trip.plannedDistance) : "",
    })
    setCompleteError("")
    setShowCompleteModal(true)
  }

  async function handleCompleteTrip(e: React.FormEvent) {
    e.preventDefault()
    setCompleteError("")
    if (!activeTripForCompletion) return

    const actualDist = Number(completeForm.actualDistance)
    const rev = Number(completeForm.revenue)
    const fuelC = Number(completeForm.fuelCost) || 0
    const fuelL = Number(completeForm.fuelLitres) || 0
    const newOdo = Number(completeForm.newOdometer)

    if (!actualDist || !rev || !newOdo) {
      setCompleteError("Actual distance, revenue, and odometer are required.")
      return
    }

    const vehicle = vehiclesList.find((v) => v.id === activeTripForCompletion.vehicleId)
    if (vehicle && newOdo < vehicle.odometer) {
      setCompleteError(`New odometer must be higher than current odometer (${vehicle.odometer} km).`)
      return
    }

    setCompleteSubmitting(true)
    try {
      await completeTrip(
        activeTripForCompletion.id,
        actualDist,
        rev,
        fuelC,
        fuelL,
        newOdo
      )
      setShowCompleteModal(false)
      setActiveTripForCompletion(null)
      loadData()
    } catch (err: any) {
      setCompleteError(err.message || "Failed to complete trip")
    } finally {
      setCompleteSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Trips & Dispatch"
        description="Create, dispatch, and complete trips with automatic status updates"
        action={
          <button 
            onClick={() => setShowNewTripModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Trip</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const count = t === "All" ? tripsList.length : tripsList.filter((x) => x.status === t).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                tab === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  tab === t ? "bg-primary-foreground/20" : "bg-secondary",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dispatch workflow...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {results.map((t) => {
              const v = vehiclesList.find((x) => x.id === t.vehicleId)
              const d = driversList.find((x) => x.id === t.driverId)
              const overloaded = v ? t.cargoWeight > v.maxLoadCapacity : false
              const loadPct = v ? Math.min(100, Math.round((t.cargoWeight / v.maxLoadCapacity) * 100)) : 0
              
              const isActionLoading = actionLoadingId === t.id

              return (
                <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-4 interactive-card shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                      <div>
                        <p className="font-semibold leading-tight">
                          {t.source} <span className="text-muted-foreground">→</span> {t.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {formatNumber(t.plannedDistance)} km planned
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="size-3.5" /> {v?.registrationNumber ?? "No vehicle"}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="size-3.5" /> {d?.name ?? "No driver"}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="size-3.5" /> {formatNumber(t.cargoWeight)} kg
                    </span>
                    <span className="text-right font-semibold tabular-nums">{formatCurrency(t.revenue)}</span>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Load capacity</span>
                      <span className={cn("font-medium", overloaded ? "text-destructive" : "text-muted-foreground")}>
                        {loadPct}% {overloaded && "· Over limit"}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn("h-full rounded-full", overloaded ? "bg-destructive" : "bg-accent")}
                        style={{ width: `${loadPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-border pt-3">
                    {t.status === "Draft" && (
                      <>
                        <button
                          disabled={overloaded || isActionLoading}
                          onClick={() => handleDispatch(t.id)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isActionLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                          Dispatch
                        </button>
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleCancel(t.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          <XCircle className="size-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    {t.status === "Dispatched" && (
                      <>
                        <button
                          disabled={isActionLoading}
                          onClick={() => openCompleteModal(t)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground transition-colors hover:opacity-90 disabled:opacity-40"
                        >
                          <CheckCircle2 className="size-3.5" /> Complete
                        </button>
                        <button
                          disabled={isActionLoading}
                          onClick={() => handleCancel(t.id)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          <XCircle className="size-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    {(t.status === "Completed" || t.status === "Cancelled") && (
                      <p className="w-full text-center text-xs text-muted-foreground">
                        {t.status === "Completed"
                          ? `Completed · ${formatNumber(t.actualDistance ?? t.plannedDistance)} km actual`
                          : "Trip cancelled — vehicle and driver released"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <Route className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No trips in this state</p>
            </div>
          )}
        </>
      )}

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowNewTripModal(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Plan New Trip</h3>
            <p className="text-xs text-muted-foreground mb-4">Create a dispatch plan for driver and cargo.</p>

            <form onSubmit={handleCreateTrip} className="space-y-3">
              {newTripError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {newTripError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Source *</label>
                  <input
                    required
                    placeholder="e.g. Austin, TX"
                    value={newTripForm.source}
                    onChange={(e) => setNewTripForm({ ...newTripForm, source: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Destination *</label>
                  <input
                    required
                    placeholder="e.g. Dallas, TX"
                    value={newTripForm.destination}
                    onChange={(e) => setNewTripForm({ ...newTripForm, destination: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Assign Vehicle *</label>
                <select
                  required
                  value={newTripForm.vehicleId}
                  onChange={(e) => setNewTripForm({ ...newTripForm, vehicleId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">Select an available vehicle</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber}) · Max {v.maxLoadCapacity} kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Assign Driver *</label>
                <select
                  required
                  value={newTripForm.driverId}
                  onChange={(e) => setNewTripForm({ ...newTripForm, driverId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">Select an available driver</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Cargo Weight (kg) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 500"
                    value={newTripForm.cargoWeight}
                    onChange={(e) => setNewTripForm({ ...newTripForm, cargoWeight: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Planned Distance (km) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 250"
                    value={newTripForm.plannedDistance}
                    onChange={(e) => setNewTripForm({ ...newTripForm, plannedDistance: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Estimated Revenue (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 1500"
                    value={newTripForm.revenue}
                    onChange={(e) => setNewTripForm({ ...newTripForm, revenue: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Trip Date *</label>
                  <input
                    required
                    type="date"
                    value={newTripForm.date}
                    onChange={(e) => setNewTripForm({ ...newTripForm, date: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              {selectedVehicle && (
                <div className={cn(
                  "p-3 rounded-lg border text-xs",
                  cargoOverlimit ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-secondary border-border text-muted-foreground"
                )}>
                  Vehicle Capacity: {selectedVehicle.maxLoadCapacity} kg. {cargoOverlimit && "Warning: Cargo load exceeds maximum vehicle load limits."}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newTripSubmitting || cargoOverlimit}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-55"
                >
                  {newTripSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {showCompleteModal && activeTripForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowCompleteModal(false)
                setActiveTripForCompletion(null)
              }}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-bold text-foreground">Complete Trip</h3>
            <p className="text-xs text-muted-foreground mb-4">Enter final trip parameters and log fuel logs.</p>

            <form onSubmit={handleCompleteTrip} className="space-y-3.5">
              {completeError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {completeError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Actual Distance (km) *</label>
                  <input
                    required
                    type="number"
                    value={completeForm.actualDistance}
                    onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Final Revenue (₹) *</label>
                  <input
                    required
                    type="number"
                    value={completeForm.revenue}
                    onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Fuel Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Cost of fuel"
                    value={completeForm.fuelCost}
                    onChange={(e) => setCompleteForm({ ...completeForm, fuelCost: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Fuel Consumed (Litres)</label>
                  <input
                    type="number"
                    placeholder="Litres"
                    value={completeForm.fuelLitres}
                    onChange={(e) => setCompleteForm({ ...completeForm, fuelLitres: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">New Odometer Reading (km) *</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 150000"
                  value={completeForm.newOdometer}
                  onChange={(e) => setCompleteForm({ ...completeForm, newOdometer: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false)
                    setActiveTripForCompletion(null)
                  }}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeSubmitting}
                  className="inline-flex items-center justify-center rounded-lg bg-success px-4 py-2 text-sm font-semibold text-success-foreground hover:opacity-90 disabled:opacity-55"
                >
                  {completeSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
