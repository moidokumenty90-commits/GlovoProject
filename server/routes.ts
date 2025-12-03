import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

// Validation schemas
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
  customerName: z.string().min(1),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1),
  customerLat: z.number(),
  customerLng: z.number(),
  houseNumber: z.string().optional(),
  apartment: z.string().optional(),
  floor: z.string().optional(),
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Register routes on app
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Courier routes
  app.get("/api/courier", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let courier = await storage.getCourierByUserId(userId);
      
      // Create courier if not exists
      if (!courier) {
        const user = await storage.getUser(userId);
        courier = await storage.createCourier({
          userId,
          name: user?.firstName || user?.email?.split("@")[0] || "Курьер",
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const courier = await storage.getCourierByUserId(userId);
      
      if (!courier) {
        return res.json(null);
      }

      const order = await storage.getActiveOrder(courier.id);
      res.json(order || null);
    } catch (error) {
      console.error("Error fetching active order:", error);
      res.status(500).json({ message: "Failed to fetch active order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Marker routes
  app.get("/api/markers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
