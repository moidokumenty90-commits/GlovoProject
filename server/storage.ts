import {
  users,
  couriers,
  orders,
  markers,
  messages,
  type User,
  type UpsertUser,
  type Courier,
  type InsertCourier,
  type Order,
  type InsertOrder,
  type Marker,
  type InsertMarker,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Courier operations
  getCourier(id: string): Promise<Courier | undefined>;
  getCourierByUserId(userId: string): Promise<Courier | undefined>;
  createCourier(courier: InsertCourier): Promise<Courier>;
  updateCourier(id: string, data: Partial<Courier>): Promise<Courier | undefined>;
  updateCourierLocation(id: string, lat: number, lng: number): Promise<Courier | undefined>;
  
  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(courierId?: string): Promise<Order[]>;
  getActiveOrder(courierId: string): Promise<Order | undefined>;
  createOrder(order: any): Promise<Order>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Marker operations
  getMarkers(courierId: string): Promise<Marker[]>;
  getMarkersByType(courierId: string, type: string): Promise<Marker[]>;
  createMarker(marker: InsertMarker): Promise<Marker>;
  deleteMarker(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Courier operations
  async getCourier(id: string): Promise<Courier | undefined> {
    const [courier] = await db.select().from(couriers).where(eq(couriers.id, id));
    return courier;
  }

  async getCourierByUserId(userId: string): Promise<Courier | undefined> {
    const [courier] = await db.select().from(couriers).where(eq(couriers.userId, userId));
    return courier;
  }

  async createCourier(courier: InsertCourier): Promise<Courier> {
    const [newCourier] = await db
      .insert(couriers)
      .values(courier)
      .returning();
    return newCourier;
  }

  async updateCourier(id: string, data: Partial<Courier>): Promise<Courier | undefined> {
    const [updated] = await db
      .update(couriers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(couriers.id, id))
      .returning();
    return updated;
  }

  async updateCourierLocation(id: string, lat: number, lng: number): Promise<Courier | undefined> {
    const [updated] = await db
      .update(couriers)
      .set({ currentLat: lat, currentLng: lng, updatedAt: new Date() })
      .where(eq(couriers.id, id))
      .returning();
    return updated;
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrders(courierId?: string): Promise<Order[]> {
    if (courierId) {
      return await db.select().from(orders).where(eq(orders.courierId, courierId));
    }
    return await db.select().from(orders);
  }

  async getOrderHistory(courierId: string, filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    customerName?: string;
  }): Promise<Order[]> {
    let query = db.select().from(orders).where(eq(orders.courierId, courierId));
    
    const conditions = [eq(orders.courierId, courierId)];
    
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(orders.status, filters.status));
    }
    
    if (filters?.customerName) {
      conditions.push(sql`LOWER(${orders.customerName}) LIKE LOWER(${'%' + filters.customerName + '%'})`);
    }
    
    if (filters?.dateFrom) {
      conditions.push(sql`${orders.createdAt} >= ${filters.dateFrom}`);
    }
    
    if (filters?.dateTo) {
      conditions.push(sql`${orders.createdAt} <= ${filters.dateTo}`);
    }
    
    return await db.select().from(orders).where(and(...conditions)).orderBy(sql`${orders.createdAt} DESC`);
  }

  async getOrderStats(courierId: string, period: "day" | "week" | "month"): Promise<{
    totalOrders: number;
    deliveredOrders: number;
    totalEarnings: number;
  }> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    const periodOrders = await db.select().from(orders).where(
      and(
        eq(orders.courierId, courierId),
        sql`${orders.createdAt} >= ${startDate}`
      )
    );
    
    const deliveredOrders = periodOrders.filter(o => o.status === "delivered");
    const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    return {
      totalOrders: periodOrders.length,
      deliveredOrders: deliveredOrders.length,
      totalEarnings,
    };
  }

  async getActiveOrder(courierId: string): Promise<Order | undefined> {
    const activeOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.courierId, courierId),
          eq(orders.status, "new")
        )
      );
    
    if (activeOrders.length > 0) return activeOrders[0];
    
    const acceptedOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.courierId, courierId),
          eq(orders.status, "accepted")
        )
      );
    
    if (acceptedOrders.length > 0) return acceptedOrders[0];
    
    const inTransitOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.courierId, courierId),
          eq(orders.status, "in_transit")
        )
      );
    
    return inTransitOrders[0];
  }

  async createOrder(order: any): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber: order.orderNumber,
        courierId: order.courierId,
        restaurantName: order.restaurantName,
        restaurantAddress: order.restaurantAddress,
        restaurantLat: order.restaurantLat,
        restaurantLng: order.restaurantLng,
        customerName: order.customerName,
        customerId: order.customerId,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        customerLat: order.customerLat,
        customerLng: order.customerLng,
        houseNumber: order.houseNumber,
        apartment: order.apartment,
        floor: order.floor,
        items: order.items || [],
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod || "cash",
        needsChange: order.needsChange || false,
        comment: order.comment,
        status: order.status || "new",
      })
      .returning();
    return newOrder;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Marker operations
  async getMarkers(courierId: string): Promise<Marker[]> {
    return await db.select().from(markers).where(eq(markers.courierId, courierId));
  }

  async getMarkersByType(courierId: string, type: string): Promise<Marker[]> {
    return await db
      .select()
      .from(markers)
      .where(
        and(
          eq(markers.courierId, courierId),
          eq(markers.type, type)
        )
      );
  }

  async createMarker(marker: InsertMarker): Promise<Marker> {
    const [newMarker] = await db
      .insert(markers)
      .values(marker)
      .returning();
    return newMarker;
  }

  async deleteMarker(id: string): Promise<boolean> {
    const result = await db.delete(markers).where(eq(markers.id, id)).returning();
    return result.length > 0;
  }

  // Message operations
  async getMessages(orderId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.orderId, orderId))
      .orderBy(sql`${messages.createdAt} ASC`);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(orderId: string, senderType: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.orderId, orderId),
          sql`${messages.senderType} != ${senderType}`
        )
      );
  }

  async getUnreadMessageCount(orderId: string, forSenderType: string): Promise<number> {
    const result = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.orderId, orderId),
          eq(messages.isRead, false),
          sql`${messages.senderType} != ${forSenderType}`
        )
      );
    return result.length;
  }
}

export const storage = new DatabaseStorage();
