"use server"

import { db } from "@/lib/db"
import { vehicles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, checkAndSeed } from "@/lib/actions/seed-helper"

export async function getVehicles() {
  const userId = await getUserId()
  await checkAndSeed(userId)
  return db.select().from(vehicles).where(eq(vehicles.userId, userId))
}

export async function addVehicle(data: {
  registrationNumber: string
  name: string
  type: string
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  region: string
}) {
  const userId = await getUserId()
  const newId = `v-${Date.now()}`

  await db.insert(vehicles).values({
    id: newId,
    userId,
    registrationNumber: data.registrationNumber,
    name: data.name,
    type: data.type,
    maxLoadCapacity: data.maxLoadCapacity,
    odometer: data.odometer,
    acquisitionCost: data.acquisitionCost,
    region: data.region,
    status: "Available",
  })

  revalidatePath("/vehicles")
  revalidatePath("/")
  return { success: true }
}

export async function updateVehicleStatus(id: string, status: string) {
  await db.update(vehicles).set({ status }).where(eq(vehicles.id, id))
  revalidatePath("/vehicles")
  revalidatePath("/")
  return { success: true }
}
