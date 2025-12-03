import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data?: any;
  clientId?: string;
  timestamp?: string;
  orderId?: string;
  message?: any;
}

interface UseWebSocketOptions {
  courierId?: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (order: any) => void;
  onChatMessage?: (orderId: string, message: any) => void;
}

export function useWebSocket({ courierId, onNewOrder, onOrderUpdate, onChatMessage }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");

        if (courierId) {
          ws.send(JSON.stringify({ type: "auth", courierId }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "connected":
              console.log("WebSocket client ID:", message.clientId);
              break;
            case "notification":
              setLastNotification(message);
              handleNotification(message.data);
              break;
            case "chat_message":
              if (message.orderId && message.message) {
                onChatMessage?.(message.orderId, message.message);
              }
              break;
            case "pong":
              break;
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
    }
  }, [courierId]);

  const handleNotification = useCallback((notification: any) => {
    if (!notification) return;

    switch (notification.type) {
      case "new_order":
        toast({
          title: notification.title,
          description: notification.message,
        });
        onNewOrder?.(notification.order);
        break;
      case "order_update":
        toast({
          title: notification.title,
          description: notification.message,
        });
        onOrderUpdate?.(notification.order);
        break;
    }
  }, [toast, onNewOrder, onOrderUpdate]);

  const authenticate = useCallback((newCourierId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "auth", courierId: newCourierId }));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  useEffect(() => {
    if (courierId && isConnected) {
      authenticate(courierId);
    }
  }, [courierId, isConnected, authenticate]);

  return {
    isConnected,
    lastNotification,
    authenticate,
  };
}
