"use server"

import { db } from "@/lib/db"
import { maintenanceLogs, vehicles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, checkAndSeed } from "@/lib/actions/seed-helper"

export async function getMaintenanceLogs() {
  const userId = await getUserId()
  await checkAndSeed(userId)
  return db
    .select()
    .from(maintenanceLogs)
    .where(eq(maintenanceLogs.userId, userId))
}

export async function logMaintenance(data: {
  vehicleId: string
  description: string
  cost: number
  startDate: string
}) {
  const userId = await getUserId()
  const newId = `m-${Date.now()}`

  await db.insert(maintenanceLogs).values({
    id: newId,
    userId,
    vehicleId: data.vehicleId,
    description: data.description,
    cost: data.cost,
    startDate: data.startDate,
    status: "Active",
  })

  // Set vehicle status to In Shop
  await db
    .update(vehicles)
    .set({ status: "In Shop" })
    .where(eq(vehicles.id, data.vehicleId))

  revalidatePath("/maintenance")
  revalidatePath("/vehicles")
  revalidatePath("/")
  return { success: true }
}

export async function closeMaintenance(id: string, cost: number, endDate: string) {
  const log = await db
    .select()
    .from(maintenanceLogs)
    .where(eq(maintenanceLogs.id, id))
    .then((res) => res[0])

  if (!log) throw new Error("Maintenance log not found")

  await db
    .update(maintenanceLogs)
    .set({
      status: "Closed",
      cost,
      endDate,
    })
    .where(eq(maintenanceLogs.id, id))

  // Set vehicle status to Available (unless retired)
  if (log.vehicleId) {
    const vehicle = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, log.vehicleId))
      .then((res) => res[0])

    if (vehicle && vehicle.status !== "Retired") {
      await db
        .update(vehicles)
        .set({ status: "Available" })
        .where(eq(vehicles.id, log.vehicleId))
    }
  }

  revalidatePath("/maintenance")
  revalidatePath("/vehicles")
  revalidatePath("/")
  return { success: true }
}
