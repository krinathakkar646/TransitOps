export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired"
export type DriverStatus = "Available" | "On Trip" | "Suspended"
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled"
export type MaintenanceStatus = "Active" | "Closed"

export interface Vehicle {
  id: string
  registrationNumber: string
  name: string
  type: "Truck" | "Van" | "Bus"
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  status: VehicleStatus
  region: string
}

export interface Driver {
  id: string
  name: string
  licenceNumber: string
  licenceCategory: string
  licenceExpiryDate: string
  phone: string
  safetyScore: number
  status: DriverStatus
}

export interface Trip {
  id: string
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: number
  plannedDistance: number
  actualDistance: number | null
  revenue: number
  status: TripStatus
  date: string
}

export interface MaintenanceLog {
  id: string
  vehicleId: string
  description: string
  cost: number
  startDate: string
  endDate: string | null
  status: MaintenanceStatus
}

export interface FuelLog {
  id: string
  vehicleId: string
  tripId: string | null
  litres: number
  cost: number
  date: string
  odometer: number
}

export interface Expense {
  id: string
  vehicleId: string
  tripId: string | null
  category: string
  amount: number
  date: string
  notes: string
}

export const vehicles: Vehicle[] = [
  { id: "v1", registrationNumber: "TX-4521", name: "Freightliner Cascadia", type: "Truck", maxLoadCapacity: 18000, odometer: 142300, acquisitionCost: 142000, status: "On Trip", region: "West" },
  { id: "v2", registrationNumber: "VN-0512", name: "Sprinter Van-05", type: "Van", maxLoadCapacity: 500, odometer: 58200, acquisitionCost: 48000, status: "Available", region: "Central" },
  { id: "v3", registrationNumber: "BS-8830", name: "Volvo 9700 Coach", type: "Bus", maxLoadCapacity: 4200, odometer: 96500, acquisitionCost: 210000, status: "In Shop", region: "East" },
  { id: "v4", registrationNumber: "TX-7712", name: "Kenworth T680", type: "Truck", maxLoadCapacity: 16000, odometer: 203400, acquisitionCost: 138000, status: "Available", region: "West" },
  { id: "v5", registrationNumber: "VN-3390", name: "Ford Transit-09", type: "Van", maxLoadCapacity: 650, odometer: 31200, acquisitionCost: 52000, status: "On Trip", region: "Central" },
  { id: "v6", registrationNumber: "TX-1180", name: "Peterbilt 579", type: "Truck", maxLoadCapacity: 17500, odometer: 178900, acquisitionCost: 145000, status: "Available", region: "South" },
  { id: "v7", registrationNumber: "BS-4409", name: "Scania Touring", type: "Bus", maxLoadCapacity: 3800, odometer: 122000, acquisitionCost: 198000, status: "Retired", region: "East" },
  { id: "v8", registrationNumber: "VN-2201", name: "Mercedes Vito-02", type: "Van", maxLoadCapacity: 480, odometer: 44100, acquisitionCost: 46000, status: "Available", region: "South" },
]

export const drivers: Driver[] = [
  { id: "d1", name: "Alex Morgan", licenceNumber: "DL-99231", licenceCategory: "Class A", licenceExpiryDate: "2027-04-18", phone: "+1 512 555 0141", safetyScore: 94, status: "On Trip" },
  { id: "d2", name: "Priya Nair", licenceNumber: "DL-77410", licenceCategory: "Class A", licenceExpiryDate: "2026-11-02", phone: "+1 512 555 0192", safetyScore: 88, status: "Available" },
  { id: "d3", name: "Marcus Lee", licenceNumber: "DL-55120", licenceCategory: "Class B", licenceExpiryDate: "2026-02-27", phone: "+1 512 555 0173", safetyScore: 76, status: "Available" },
  { id: "d4", name: "Sofia Reyes", licenceNumber: "DL-33098", licenceCategory: "Class A", licenceExpiryDate: "2025-12-15", phone: "+1 512 555 0128", safetyScore: 91, status: "On Trip" },
  { id: "d5", name: "David Osei", licenceNumber: "DL-11876", licenceCategory: "Class C", licenceExpiryDate: "2024-08-30", phone: "+1 512 555 0155", safetyScore: 62, status: "Suspended" },
  { id: "d6", name: "Hana Kim", licenceNumber: "DL-64522", licenceCategory: "Class B", licenceExpiryDate: "2027-09-09", phone: "+1 512 555 0110", safetyScore: 97, status: "Available" },
]

export const trips: Trip[] = [
  { id: "t1", source: "Austin, TX", destination: "Dallas, TX", vehicleId: "v1", driverId: "d1", cargoWeight: 15200, plannedDistance: 315, actualDistance: 322, revenue: 4200, status: "Dispatched", date: "2026-07-11" },
  { id: "t2", source: "Houston, TX", destination: "San Antonio, TX", vehicleId: "v5", driverId: "d4", cargoWeight: 420, plannedDistance: 197, actualDistance: null, revenue: 1350, status: "Dispatched", date: "2026-07-12" },
  { id: "t3", source: "Dallas, TX", destination: "El Paso, TX", vehicleId: "v4", driverId: "d2", cargoWeight: 12800, plannedDistance: 635, actualDistance: 641, revenue: 6800, status: "Completed", date: "2026-07-08" },
  { id: "t4", source: "Austin, TX", destination: "Waco, TX", vehicleId: "v6", driverId: "d6", cargoWeight: 9500, plannedDistance: 103, actualDistance: 108, revenue: 1900, status: "Completed", date: "2026-07-07" },
  { id: "t5", source: "San Antonio, TX", destination: "Laredo, TX", vehicleId: "v8", driverId: "d3", cargoWeight: 310, plannedDistance: 158, actualDistance: null, revenue: 1100, status: "Draft", date: "2026-07-12" },
  { id: "t6", source: "Fort Worth, TX", destination: "Lubbock, TX", vehicleId: "v4", driverId: "d2", cargoWeight: 14100, plannedDistance: 342, actualDistance: null, revenue: 3600, status: "Cancelled", date: "2026-07-05" },
]

export const maintenanceLogs: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", description: "Transmission overhaul & brake service", cost: 3800, startDate: "2026-07-09", endDate: null, status: "Active" },
  { id: "m2", vehicleId: "v2", description: "Oil change & tire rotation", cost: 320, startDate: "2026-06-28", endDate: "2026-06-29", status: "Closed" },
  { id: "m3", vehicleId: "v1", description: "Annual DOT inspection", cost: 540, startDate: "2026-06-15", endDate: "2026-06-16", status: "Closed" },
  { id: "m4", vehicleId: "v6", description: "Coolant flush & battery replacement", cost: 610, startDate: "2026-06-20", endDate: "2026-06-21", status: "Closed" },
]

export const fuelLogs: FuelLog[] = [
  { id: "f1", vehicleId: "v1", tripId: "t1", litres: 210, cost: 315, date: "2026-07-11", odometer: 142300 },
  { id: "f2", vehicleId: "v4", tripId: "t3", litres: 420, cost: 630, date: "2026-07-08", odometer: 203400 },
  { id: "f3", vehicleId: "v6", tripId: "t4", litres: 88, cost: 132, date: "2026-07-07", odometer: 178900 },
  { id: "f4", vehicleId: "v5", tripId: "t2", litres: 46, cost: 69, date: "2026-07-12", odometer: 31200 },
]

export const expenses: Expense[] = [
  { id: "e1", vehicleId: "v1", tripId: "t1", category: "Tolls", amount: 78, date: "2026-07-11", notes: "I-35 corridor" },
  { id: "e2", vehicleId: "v4", tripId: "t3", category: "Driver meals", amount: 120, date: "2026-07-08", notes: "Overnight haul" },
  { id: "e3", vehicleId: "v3", tripId: null, category: "Parts", amount: 3800, date: "2026-07-09", notes: "Transmission" },
  { id: "e4", vehicleId: "v6", tripId: "t4", category: "Parking", amount: 25, date: "2026-07-07", notes: "Waco depot" },
]

export function getVehicle(id: string) {
  return vehicles.find((v) => v.id === id)
}

export function getDriver(id: string) {
  return drivers.find((d) => d.id === id)
}

export function getKpis() {
  const nonRetired = vehicles.filter((v) => v.status !== "Retired")
  const onTrip = vehicles.filter((v) => v.status === "On Trip")
  const available = vehicles.filter((v) => v.status === "Available")
  const inShop = vehicles.filter((v) => v.status === "In Shop")
  const activeTrips = trips.filter((t) => t.status === "Dispatched")
  const pendingTrips = trips.filter((t) => t.status === "Draft")
  const driversOnDuty = drivers.filter((d) => d.status === "On Trip")

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0)
  const totalFuelLitres = fuelLogs.reduce((s, f) => s + f.litres, 0)
  const totalMaintenance = maintenanceLogs.reduce((s, m) => s + m.cost, 0)
  const totalDistance = trips
    .filter((t) => t.actualDistance)
    .reduce((s, t) => s + (t.actualDistance ?? 0), 0)
  const totalRevenue = trips
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + t.revenue, 0)

  const utilization = nonRetired.length
    ? Math.round((onTrip.length / nonRetired.length) * 100)
    : 0
  const fuelEfficiency = totalFuelLitres ? totalDistance / totalFuelLitres : 0
  const operationalCost = totalFuelCost + totalMaintenance
  const acquisitionTotal = vehicles.reduce((s, v) => s + v.acquisitionCost, 0)
  const roi = acquisitionTotal
    ? ((totalRevenue - operationalCost) / acquisitionTotal) * 100
    : 0

  return {
    activeVehicles: onTrip.length,
    availableVehicles: available.length,
    inShop: inShop.length,
    activeTrips: activeTrips.length,
    pendingTrips: pendingTrips.length,
    driversOnDuty: driversOnDuty.length,
    utilization,
    fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
    operationalCost,
    roi: Number(roi.toFixed(1)),
    totalRevenue,
    totalFuelCost,
    totalMaintenance,
  }
}
