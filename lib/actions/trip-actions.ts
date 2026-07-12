"use server"

import { db } from "@/lib/db"
import { trips, vehicles, drivers, fuelLogs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, checkAndSeed } from "@/lib/actions/seed-helper"

export async function getTrips() {
  const userId = await getUserId()
  await checkAndSeed(userId)
  return db.select().from(trips).where(eq(trips.userId, userId))
}

export async function createTrip(data: {
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: number
  plannedDistance: number
  revenue: number
  date: string
}) {
  const userId = await getUserId()
  const newId = `t-${Date.now()}`

  // Validate weight limit
  const vehicle = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, data.vehicleId))
    .then((res) => res[0])

  if (vehicle && data.cargoWeight > vehicle.maxLoadCapacity) {
    throw new Error("Cargo weight exceeds vehicle max load capacity")
  }

  await db.insert(trips).values({
    id: newId,
    userId,
    source: data.source,
    destination: data.destination,
    vehicleId: data.vehicleId,
    driverId: data.driverId,
    cargoWeight: data.cargoWeight,
    plannedDistance: data.plannedDistance,
    revenue: data.revenue,
    status: "Draft",
    date: data.date,
  })

  revalidatePath("/trips")
  revalidatePath("/")
  return { success: true }
}

export async function dispatchTrip(id: string) {
  const trip = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .then((res) => res[0])

  if (!trip) throw new Error("Trip not found")

  // Check vehicle status
  if (trip.vehicleId) {
    const vehicle = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, trip.vehicleId))
      .then((res) => res[0])

    if (!vehicle || vehicle.status !== "Available") {
      throw new Error("Selected vehicle is not available for dispatch")
    }

    await db
      .update(vehicles)
      .set({ status: "On Trip" })
      .where(eq(vehicles.id, trip.vehicleId))
  }

  // Check driver status
  if (trip.driverId) {
    const driver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, trip.driverId))
      .then((res) => res[0])

    if (!driver || driver.status !== "Available") {
      throw new Error("Selected driver is not available for dispatch")
    }

    await db
      .update(drivers)
      .set({ status: "On Trip" })
      .where(eq(drivers.id, trip.driverId))
  }

  await db
    .update(trips)
    .set({ status: "Dispatched" })
    .where(eq(trips.id, id))

  revalidatePath("/trips")
  revalidatePath("/")
  return { success: true }
}

export async function completeTrip(
  id: string,
  actualDistance: number,
  revenue: number,
  fuelCost: number,
  fuelLitres: number,
  newOdometer: number
) {
  const userId = await getUserId()
  const trip = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .then((res) => res[0])

  if (!trip) throw new Error("Trip not found")

  // Update trip details
  await db
    .update(trips)
    .set({
      status: "Completed",
      actualDistance,
      revenue,
    })
    .where(eq(trips.id, id))

  // Update vehicle
  if (trip.vehicleId) {
    await db
      .update(vehicles)
      .set({
        status: "Available",
        odometer: newOdometer,
      })
      .where(eq(vehicles.id, trip.vehicleId))

    // Log fuel log
    if (fuelLitres > 0 || fuelCost > 0) {
      await db.insert(fuelLogs).values({
        id: `f-${Date.now()}`,
        userId,
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        litres: fuelLitres,
        cost: fuelCost,
        date: new Date().toISOString().split("T")[0],
        odometer: newOdometer,
      })
    }
  }

  // Update driver
  if (trip.driverId) {
    await db
      .update(drivers)
      .set({ status: "Available" })
      .where(eq(drivers.id, trip.driverId))
  }

  revalidatePath("/trips")
  revalidatePath("/")
  return { success: true }
}

export async function cancelTrip(id: string) {
  const trip = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .then((res) => res[0])

  if (!trip) throw new Error("Trip not found")

  await db
    .update(trips)
    .set({ status: "Cancelled" })
    .where(eq(trips.id, id))

  // Release vehicle
  if (trip.vehicleId) {
    await db
      .update(vehicles)
      .set({ status: "Available" })
      .where(eq(vehicles.id, trip.vehicleId))
  }

  // Release driver
  if (trip.driverId) {
    await db
      .update(drivers)
      .set({ status: "Available" })
      .where(eq(drivers.id, trip.driverId))
  }

  revalidatePath("/trips")
  revalidatePath("/")
  return { success: true }
}
