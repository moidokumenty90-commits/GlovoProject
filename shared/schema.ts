import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User active sessions - tracks which session is active for each user (single-device enforcement)
export const userSessions = pgTable("user_sessions", {
  userId: varchar("user_id").primaryKey(), // Only one active session per user
  sessionId: varchar("session_id").notNull(),
  deviceInfo: text("device_info"), // User agent / device info
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserSession = typeof userSessions.$inferSelect;

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Courier table - stores courier profile and status
export const couriers = pgTable("couriers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull().default("Курьер"),
  isOnline: boolean("is_online").notNull().default(false),
  currentLat: doublePrecision("current_lat"),
  currentLng: doublePrecision("current_lng"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourierSchema = createInsertSchema(couriers).omit({
  id: true,
  updatedAt: true,
});

export type InsertCourier = z.infer<typeof insertCourierSchema>;
export type Courier = typeof couriers.$inferSelect;

// Order items schema (for JSON storage)
export const orderItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().default(1),
  modifiers: z.string().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Orders table - stores delivery orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull(),
  courierId: varchar("courier_id").references(() => couriers.id),
  
  // Restaurant info
  restaurantName: text("restaurant_name").notNull(),
  restaurantAddress: text("restaurant_address").notNull(),
  restaurantLat: doublePrecision("restaurant_lat").notNull(),
  restaurantLng: doublePrecision("restaurant_lng").notNull(),
  restaurantCompany: text("restaurant_company"), // Company name (e.g., "VARUS")
  restaurantComment: text("restaurant_comment"), // Pickup instructions
  
  // Customer info
  customerName: text("customer_name").notNull(),
  customerId: text("customer_id"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address").notNull(),
  customerLat: doublePrecision("customer_lat").notNull(),
  customerLng: doublePrecision("customer_lng").notNull(),
  houseNumber: text("house_number"),
  apartment: text("apartment"),
  floor: text("floor"),
  buildingInfo: text("building_info"), // Building info (e.g., "Здание: Пологовий стаціонар")
  
  // Order details
  items: jsonb("items").$type<OrderItem[]>().notNull().default([]),
  totalPrice: doublePrecision("total_price").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, card
  needsChange: boolean("needs_change").default(false),
  comment: text("comment"),
  
  // Status: new, accepted, in_transit, delivered
  status: text("status").notNull().default("new"),
  
  // Grouping for multi-order pickup
  pickupGroupId: text("pickup_group_id"), // Groups orders from same restaurant
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Markers table - stores saved location markers
export const markers = pgTable("markers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courierId: varchar("courier_id").references(() => couriers.id),
  type: text("type").notNull(), // restaurant, customer
  name: text("name").notNull(),
  address: text("address"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarkerSchema = createInsertSchema(markers).omit({
  id: true,
  createdAt: true,
});

export type InsertMarker = z.infer<typeof insertMarkerSchema>;
export type Marker = typeof markers.$inferSelect;

// Messages table for chat
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  senderId: varchar("sender_id").notNull(), // courierId or "customer"
  senderType: text("sender_type").notNull(), // "courier" or "customer"
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Order status enum for frontend
export const ORDER_STATUSES = {
  NEW: "new",
  ACCEPTED: "accepted",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

// Payment methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
