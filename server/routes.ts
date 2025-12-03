import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { COURIER_INFO } from "./authConfig";
import { z } from "zod";
import { wsManager } from "./websocket";

const updateCourierSchema = z.object({
  name: z.string().optional(),
  isOnline: z.boolean().optional(),
});

const updateLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const createOrderSchema = z.object({
  orderNumber: z.string().min(1),
  restaurantName: z.string().min(1),
  restaurantAddress: z.string().min(1),
  restaurantLat: z.number(),
  restaurantLng: z.number(),
  restaurantCompany: z.string().optional(),
  restaurantComment: z.string().optional(),
  customerName: z.string().min(1),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1),
  customerLat: z.number(),
  customerLng: z.number(),
  houseNumber: z.string().optional(),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  buildingInfo: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
    modifiers: z.string().optional(),
  })).optional(),
  totalPrice: z.number(),
  paymentMethod: z.enum(["cash", "card"]).default("cash"),
  needsChange: z.boolean().optional(),
  comment: z.string().optional(),
  pickupGroupId: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["new", "accepted", "in_transit", "delivered"]),
});

const createMarkerSchema = z.object({
  type: z.enum(["restaurant", "customer"]),
  name: z.string().min(1),
  address: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
});

export async function registerRoutes(app: Express): Promise<void> {
  setupSimpleAuth(app);

  app.get("/api/courier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      let courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        courier = await storage.createCourier({
          userId,
          name: COURIER_INFO.name,
          isOnline: false,
        });
      }
      
      res.json(courier);
    } catch (error) {
      console.error("Error fetching courier:", error);
      res.status(500).json({ message: "Failed to fetch courier" });
    }
  });

  app.patch("/api/courier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      const result = updateCourierSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.flatten() });
      }

      const updated = await storage.updateCourier(courier.id, result.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating courier:", error);
      res.status(500).json({ message: "Failed to update courier" });
    }
  });

  app.patch("/api/courier/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      const { isOnline } = req.body;
      const updated = await storage.updateCourier(courier.id, { isOnline });
      res.json(updated);
    } catch (error) {
      console.error("Error updating courier status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.patch("/api/courier/location", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      const result = updateLocationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid location data" });
      }

      const updated = await storage.updateCourierLocation(courier.id, result.data.lat, result.data.lng);
      res.json(updated);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json([]);
      }

      const orders = await storage.getOrders(courier.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json([]);
      }

      const orders = await storage.getActiveOrders(courier.id);
      res.json(orders || []);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      res.status(500).json({ message: "Failed to fetch active orders" });
    }
  });

  app.get("/api/orders/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json([]);
      }

      const { status, dateFrom, dateTo, customerName } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status;
      if (customerName) filters.customerName = customerName;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);

      const orders = await storage.getOrderHistory(courier.id, filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: "Failed to fetch order history" });
    }
  });

  app.get("/api/orders/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json({ daily: null, weekly: null, monthly: null });
      }

      const [daily, weekly, monthly] = await Promise.all([
        storage.getOrderStats(courier.id, "day"),
        storage.getOrderStats(courier.id, "week"),
        storage.getOrderStats(courier.id, "month"),
      ]);

      res.json({ daily, weekly, monthly });
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ message: "Failed to fetch order stats" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      const result = createOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid order data", errors: result.error.flatten() });
      }

      const orderData = {
        ...result.data,
        courierId: courier.id,
        status: "new",
      };

      const order = await storage.createOrder(orderData);
      
      wsManager.broadcastNewOrder(courier.id, order);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const result = updateOrderStatusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, result.data.status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      wsManager.broadcastOrderStatusChange(order.courierId!, order);
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const order = await storage.updateOrder(id, req.body);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.patch("/api/orders/:id/location", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { type, lat, lng } = req.body;
      
      if (!type || !lat || !lng) {
        return res.status(400).json({ message: "Missing type, lat or lng" });
      }
      
      const updateData = type === "restaurant" 
        ? { restaurantLat: lat, restaurantLng: lng }
        : { customerLat: lat, customerLng: lng };
      
      const order = await storage.updateOrder(id, updateData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order location:", error);
      res.status(500).json({ message: "Failed to update order location" });
    }
  });

  app.delete("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOrder(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  app.get("/api/markers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json([]);
      }

      const markers = await storage.getMarkers(courier.id);
      res.json(markers);
    } catch (error) {
      console.error("Error fetching markers:", error);
      res.status(500).json({ message: "Failed to fetch markers" });
    }
  });

  app.post("/api/markers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      const result = createMarkerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid marker data", errors: result.error.flatten() });
      }

      const markerData = {
        ...result.data,
        courierId: courier.id,
      };

      const marker = await storage.createMarker(markerData);
      res.json(marker);
    } catch (error) {
      console.error("Error creating marker:", error);
      res.status(500).json({ message: "Failed to create marker" });
    }
  });

  app.patch("/api/markers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;
      
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      const marker = await storage.updateMarkerPosition(id, lat, lng);
      
      if (!marker) {
        return res.status(404).json({ message: "Marker not found" });
      }

      res.json(marker);
    } catch (error) {
      console.error("Error updating marker:", error);
      res.status(500).json({ message: "Failed to update marker" });
    }
  });

  app.delete("/api/markers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMarker(id);
      
      if (!success) {
        return res.status(404).json({ message: "Marker not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting marker:", error);
      res.status(500).json({ message: "Failed to delete marker" });
    }
  });

  // Chat/Messages routes with authorization check
  app.get("/api/orders/:orderId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      // Verify order belongs to this courier
      const order = await storage.getOrder(orderId);
      if (!order || order.courierId !== courier.id) {
        return res.status(403).json({ message: "Unauthorized access to order" });
      }

      const messages = await storage.getMessages(orderId);
      
      // Mark messages as read for courier
      await storage.markMessagesAsRead(orderId, "courier");
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/orders/:orderId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { content } = req.body;
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      // Verify order belongs to this courier
      const order = await storage.getOrder(orderId);
      if (!order || order.courierId !== courier.id) {
        return res.status(403).json({ message: "Unauthorized access to order" });
      }

      if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({ message: "Message content is required" });
      }

      const message = await storage.createMessage({
        orderId,
        senderId: courier.id,
        senderType: "courier",
        content: content.trim(),
        isRead: false,
      });

      // Broadcast to all connected clients for this order
      wsManager.broadcastChatMessage(orderId, message);

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/orders/:orderId/unread", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.userId;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.status(404).json({ message: "Courier not found" });
      }

      // Verify order belongs to this courier
      const order = await storage.getOrder(orderId);
      if (!order || order.courierId !== courier.id) {
        return res.status(403).json({ message: "Unauthorized access to order" });
      }

      const count = await storage.getUnreadMessageCount(orderId, "courier");
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

}
