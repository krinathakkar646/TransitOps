"use server"

import { db } from "@/lib/db"
import { drivers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId, checkAndSeed } from "@/lib/actions/seed-helper"

export async function getDrivers() {
  const userId = await getUserId()
  await checkAndSeed(userId)
  return db.select().from(drivers).where(eq(drivers.userId, userId))
}

export async function addDriver(data: {
  name: string
  licenceNumber: string
  licenceCategory: string
  licenceExpiryDate: string
  phone: string
  safetyScore: number
}) {
  const userId = await getUserId()
  const newId = `d-${Date.now()}`

  await db.insert(drivers).values({
    id: newId,
    userId,
    name: data.name,
    licenceNumber: data.licenceNumber,
    licenceCategory: data.licenceCategory,
    licenceExpiryDate: data.licenceExpiryDate,
    phone: data.phone,
    safetyScore: data.safetyScore,
    status: "Available",
  })

  revalidatePath("/drivers")
  revalidatePath("/")
  return { success: true }
}
