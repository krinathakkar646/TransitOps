"use server"

import { db } from "@/lib/db"
import { vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses } from "@/lib/db/schema"
import { eq, ne, and, sql, desc } from "drizzle-orm"
import { getUserId, checkAndSeed } from "@/lib/actions/seed-helper"

export async function getDashboardKpis() {
  const userId = await getUserId()
  await checkAndSeed(userId)

  // Fetch all user records
  const allVehicles = await db.select().from(vehicles).where(eq(vehicles.userId, userId))
  const allDrivers = await db.select().from(drivers).where(eq(drivers.userId, userId))
  const allTrips = await db.select().from(trips).where(eq(trips.userId, userId))
  const allMaintenance = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.userId, userId))
  const allFuel = await db.select().from(fuelLogs).where(eq(fuelLogs.userId, userId))

  // Calculations
  const nonRetired = allVehicles.filter((v) => v.status !== "Retired")
  const onTrip = allVehicles.filter((v) => v.status === "On Trip")
  const available = allVehicles.filter((v) => v.status === "Available")
  const inShop = allVehicles.filter((v) => v.status === "In Shop")

  const activeTrips = allTrips.filter((t) => t.status === "Dispatched")
  const pendingTrips = allTrips.filter((t) => t.status === "Draft")
  const driversOnDuty = allDrivers.filter((d) => d.status === "On Trip")

  const totalFuelCost = allFuel.reduce((s, f) => s + f.cost, 0)
  const totalFuelLitres = allFuel.reduce((s, f) => s + f.litres, 0)
  const totalMaintenance = allMaintenance.reduce((s, m) => s + m.cost, 0)
  const totalDistance = allTrips
    .filter((t) => t.actualDistance)
    .reduce((s, t) => s + (t.actualDistance ?? 0), 0)
  const totalRevenue = allTrips
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + t.revenue, 0)

  const utilization = nonRetired.length
    ? Math.round((onTrip.length / nonRetired.length) * 100)
    : 0
  const fuelEfficiency = totalFuelLitres ? totalDistance / totalFuelLitres : 0
  const operationalCost = totalFuelCost + totalMaintenance
  const acquisitionTotal = allVehicles.reduce((s, v) => s + v.acquisitionCost, 0)
  const roi = acquisitionTotal
    ? ((totalRevenue - operationalCost) / acquisitionTotal) * 100
    : 0

  // Fetch recent trips (limit 5, sorted by date desc)
  const recentTripsResult = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.date))
    .limit(5)

  // Status counts for status charts
  const statusCounts = ["Available", "On Trip", "In Shop", "Retired"].map((s) => ({
    name: s,
    value: allVehicles.filter((v) => v.status === s).length,
  }))

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
    recentTrips: recentTripsResult,
    vehiclesList: allVehicles,
    driversList: allDrivers,
    allTripsList: allTrips,
    statusCounts,
  }
}
