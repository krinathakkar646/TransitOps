import { pgTable, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Every table carries a plain `userId` for per-user scoping (no FK by design).

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  registrationNumber: text("registrationNumber").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  maxLoadCapacity: integer("maxLoadCapacity").notNull().default(0),
  odometer: integer("odometer").notNull().default(0),
  acquisitionCost: integer("acquisitionCost").notNull().default(0),
  status: text("status").notNull().default("Available"),
  region: text("region").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const drivers = pgTable("drivers", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  licenceNumber: text("licenceNumber").notNull(),
  licenceCategory: text("licenceCategory").notNull().default("Class A"),
  licenceExpiryDate: text("licenceExpiryDate").notNull(),
  phone: text("phone").notNull().default(""),
  safetyScore: integer("safetyScore").notNull().default(80),
  status: text("status").notNull().default("Available"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: text("vehicleId"),
  driverId: text("driverId"),
  cargoWeight: integer("cargoWeight").notNull().default(0),
  plannedDistance: integer("plannedDistance").notNull().default(0),
  actualDistance: integer("actualDistance"),
  revenue: integer("revenue").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  date: text("date").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  vehicleId: text("vehicleId"),
  description: text("description").notNull(),
  cost: integer("cost").notNull().default(0),
  startDate: text("startDate").notNull(),
  endDate: text("endDate"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const fuelLogs = pgTable("fuel_logs", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  vehicleId: text("vehicleId"),
  tripId: text("tripId"),
  litres: doublePrecision("litres").notNull().default(0),
  cost: integer("cost").notNull().default(0),
  date: text("date").notNull(),
  odometer: integer("odometer").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  vehicleId: text("vehicleId"),
  tripId: text("tripId"),
  category: text("category").notNull(),
  amount: integer("amount").notNull().default(0),
  date: text("date").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
