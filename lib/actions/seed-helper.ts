import { db } from "@/lib/db"
import { vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

import {
  vehicles as seedVehicles,
  drivers as seedDrivers,
  trips as seedTrips,
  maintenanceLogs as seedLogs,
  fuelLogs as seedFuel,
  expenses as seedExpenses,
} from "@/lib/data"

export async function getUserId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user?.id ?? "dev-user-id"
  } catch (e) {
    return "dev-user-id"
  }
}

export async function checkAndSeed(userId: string) {
  // Check if this specific user already has vehicles in the system
  const existingVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId))
    .limit(1)

  if (existingVehicles.length === 0) {
    try {
      // Seed vehicles (scoped by userId)
      for (const v of seedVehicles) {
        await db.insert(vehicles).values({
          id: `${userId}-${v.id}`,
          userId,
          registrationNumber: v.registrationNumber,
          name: v.name,
          type: v.type,
          maxLoadCapacity: v.maxLoadCapacity,
          odometer: v.odometer,
          acquisitionCost: v.acquisitionCost,
          status: v.status,
          region: v.region,
        })
      }

      // Seed drivers (scoped by userId)
      for (const d of seedDrivers) {
        await db.insert(drivers).values({
          id: `${userId}-${d.id}`,
          userId,
          name: d.name,
          licenceNumber: d.licenceNumber,
          licenceCategory: d.licenceCategory,
          licenceExpiryDate: d.licenceExpiryDate,
          phone: d.phone,
          safetyScore: d.safetyScore,
          status: d.status,
        })
      }

      // Seed trips (scoped by userId, mapping vehicle & driver FKs)
      for (const t of seedTrips) {
        await db.insert(trips).values({
          id: `${userId}-${t.id}`,
          userId,
          source: t.source,
          destination: t.destination,
          vehicleId: t.vehicleId ? `${userId}-${t.vehicleId}` : null,
          driverId: t.driverId ? `${userId}-${t.driverId}` : null,
          cargoWeight: t.cargoWeight,
          plannedDistance: t.plannedDistance,
          actualDistance: t.actualDistance,
          revenue: t.revenue,
          status: t.status,
          date: t.date,
        })
      }

      // Seed maintenance logs (scoped by userId, mapping vehicle FK)
      for (const m of seedLogs) {
        await db.insert(maintenanceLogs).values({
          id: `${userId}-${m.id}`,
          userId,
          vehicleId: m.vehicleId ? `${userId}-${m.vehicleId}` : null,
          description: m.description,
          cost: m.cost,
          startDate: m.startDate,
          endDate: m.endDate,
          status: m.status,
        })
      }

      // Seed fuel logs (scoped by userId, mapping vehicle & trip FKs)
      for (const f of seedFuel) {
        await db.insert(fuelLogs).values({
          id: `${userId}-${f.id}`,
          userId,
          vehicleId: f.vehicleId ? `${userId}-${f.vehicleId}` : null,
          tripId: f.tripId ? `${userId}-${f.tripId}` : null,
          litres: f.litres,
          cost: f.cost,
          date: f.date,
          odometer: f.odometer,
        })
      }

      // Seed expenses (scoped by userId, mapping vehicle & trip FKs)
      for (const e of seedExpenses) {
        await db.insert(expenses).values({
          id: `${userId}-${e.id}`,
          userId,
          vehicleId: e.vehicleId ? `${userId}-${e.vehicleId}` : null,
          tripId: e.tripId ? `${userId}-${e.tripId}` : null,
          category: e.category,
          amount: e.amount,
          date: e.date,
          notes: e.notes,
        })
      }
      
      console.log(`[Seed Helper] Seeding completed successfully for user: ${userId}`)
    } catch (error) {
      console.error("[Seed Helper] Seeding failed with error:", error)
    }
  }
}
