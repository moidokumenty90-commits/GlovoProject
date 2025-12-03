import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface ClientInfo {
  ws: WebSocket;
  courierId?: string;
  userId?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientInfo> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, { ws });

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (e) {
          console.error("Invalid WebSocket message:", e);
        }
      });

      ws.on("close", () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on("error", (err) => {
        console.error(`WebSocket error for client ${clientId}:`, err);
        this.clients.delete(clientId);
      });

      ws.send(JSON.stringify({ type: "connected", clientId }));
    });

    console.log("WebSocket server initialized");
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case "auth":
        client.courierId = message.courierId;
        client.userId = message.userId;
        console.log(`Client ${clientId} authenticated as courier ${message.courierId}`);
        break;
      case "ping":
        client.ws.send(JSON.stringify({ type: "pong" }));
        break;
    }
  }

  notifyCourier(courierId: string, notification: any) {
    Array.from(this.clients.values()).forEach((client) => {
      if (client.courierId === courierId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: "notification",
          data: notification,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  }

  broadcastNewOrder(courierId: string, order: any) {
    this.notifyCourier(courierId, {
      type: "new_order",
      title: "Новый заказ!",
      message: `Заказ #${order.orderNumber} от ${order.restaurantName}`,
      order,
    });
  }

  broadcastOrderStatusChange(courierId: string, order: any) {
    this.notifyCourier(courierId, {
      type: "order_update",
      title: "Обновление заказа",
      message: `Статус заказа #${order.orderNumber} изменен`,
      order,
    });
  }

  broadcastChatMessage(orderId: string, message: any) {
    Array.from(this.clients.values()).forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: "chat_message",
          orderId,
          message,
          timestamp: new Date().toISOString(),
        }));
      }
    });
  }
}

export const wsManager = new WebSocketManager();
