import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapView, MapViewRef } from "@/components/MapView";
import { TopBar } from "@/components/TopBar";
import { OrderPanel } from "@/components/OrderPanel";
import { BottomPanel } from "@/components/BottomPanel";
import { BurgerMenu } from "@/components/BurgerMenu";
import { NavigationButton } from "@/components/NavigationButton";
import { DeliveryConfirmDialog } from "@/components/ConfirmDialog";
import { MarkerDialog, DeleteMarkerDialog } from "@/components/MarkerDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Courier, Order, Marker } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const mapRef = useRef<MapViewRef>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderPanelState, setOrderPanelState] = useState<"collapsed" | "default" | "expanded">("default");
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Marker adding mode
  const [addingMarkerType, setAddingMarkerType] = useState<"restaurant" | "customer" | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  
  // Delete marker dialogs
  const [deleteRestaurantOpen, setDeleteRestaurantOpen] = useState(false);
  const [deleteCustomerOpen, setDeleteCustomerOpen] = useState(false);
  
  // Chat
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch courier data
  const { data: courier, isLoading: courierLoading } = useQuery<Courier>({
    queryKey: ["/api/courier"],
  });

  // Fetch active orders (can be multiple from same restaurant)
  const { data: activeOrders = [], isLoading: orderLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/active"],
    refetchInterval: 10000,
  });
  
  // For backward compatibility - get first order
  const order = activeOrders.length > 0 ? activeOrders[0] : null;

  // WebSocket for real-time notifications
  const { isConnected: wsConnected } = useWebSocket({
    courierId: courier?.id,
    onNewOrder: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
    },
    onOrderUpdate: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
    },
  });

  // Fetch markers
  const { data: markers = [] } = useQuery<Marker[]>({
    queryKey: ["/api/markers"],
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/courier/status", {
        isOnline: !courier?.isOnline,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive",
      });
    },
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (location: { lat: number; lng: number }) => {
      return await apiRequest("PATCH", "/api/courier/location", location);
    },
  });

  // Accept order mutation (confirm pickup)
  const confirmPickupMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
        status: "in_transit",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      toast({
        title: "Заказ получен",
        description: "Теперь доставьте заказ клиенту",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
    },
  });

  // Confirm delivery mutation
  const confirmDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
        status: "delivered",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      setConfirmDeliveryOpen(false);
      toast({
        title: "Доставлено!",
        description: "Заказ успешно доставлен",
      });
    },
  });

  // Create marker mutation
  const createMarkerMutation = useMutation({
    mutationFn: async (data: { type: string; name: string; address: string; lat: number; lng: number }) => {
      return await apiRequest("POST", "/api/markers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/markers"] });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async () => {
      if (!order) return;
      return await apiRequest("DELETE", `/api/orders/${order.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      toast({
        title: "Заказ удалён",
        description: "Заказ успешно удалён",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заказ",
        variant: "destructive",
      });
    },
  });

  // Delete marker mutation
  const deleteMarkerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/markers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/markers"] });
    },
  });

  // Watch geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCourierLocation(newLocation);
        
        // Update server with new location
        if (courier?.isOnline) {
          updateLocationMutation.mutate(newLocation);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [courier?.isOnline]);

  // Start adding marker mode
  const startAddingMarker = (type: "restaurant" | "customer") => {
    setAddingMarkerType(type);
    setMarkerPosition(null);
    setMenuOpen(false);
  };

  // Cancel adding marker
  const cancelAddingMarker = () => {
    setAddingMarkerType(null);
    setMarkerPosition(null);
  };

  // Confirm marker position and show dialog
  const confirmMarkerPosition = () => {
    if (markerPosition) {
      setShowMarkerDialog(true);
    }
  };

  // Handle marker save from dialog
  const handleSaveMarker = (data: { name: string; address: string; lat: number; lng: number }) => {
    if (!addingMarkerType) return;
    createMarkerMutation.mutate({ type: addingMarkerType, ...data });
    setAddingMarkerType(null);
    setMarkerPosition(null);
    setShowMarkerDialog(false);
  };

  // Filter markers by type
  const restaurantMarkers = markers.filter((m) => m.type === "restaurant");
  const customerMarkers = markers.filter((m) => m.type === "customer");

  if (courierLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden" data-testid="home-screen">
      {/* Map - lower z-index */}
      <div className="absolute inset-0 z-0">
        <MapView
          ref={mapRef}
          courierLocation={courierLocation}
          order={order || null}
          markers={markers}
          draggableMarker={addingMarkerType ? {
            type: addingMarkerType,
            onPositionChange: (lat, lng) => setMarkerPosition({ lat, lng }),
          } : null}
        />
      </div>

      {/* Marker Adding Controls */}
      {addingMarkerType && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <span className="text-sm font-medium">
            {addingMarkerType === "restaurant" ? "Перетащите метку заведения" : "Перетащите метку клиента"}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={cancelAddingMarker}
              data-testid="button-cancel-marker-position"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={confirmMarkerPosition}
              disabled={!markerPosition}
              data-testid="button-confirm-marker-position"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Top Bar - higher z-index (hidden when adding marker) */}
      {!addingMarkerType && (
        <div className="relative z-30">
          <TopBar
            isOnline={courier?.isOnline || false}
            onToggleStatus={() => toggleStatusMutation.mutate()}
            onMenuClick={() => setMenuOpen(true)}
          />
        </div>
      )}

      {/* Right Side Floating Buttons - Hidden when order panel is visible */}
      {!order && (
        <div 
          className="absolute right-4 z-30 flex flex-col gap-3 transition-all duration-300"
          style={{ bottom: panelExpanded ? "calc(85vh + 16px)" : "100px" }}
        >
          {/* GPS/Location Button - Circle style */}
          <button
            onClick={() => {
              if (courierLocation && mapRef.current) {
                mapRef.current.centerOnLocation(courierLocation.lat, courierLocation.lng);
              }
            }}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
            data-testid="button-center-location"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </button>
        </div>
      )}

      {/* Order Panel - Show when there are active orders */}
      {activeOrders.length > 0 && (
        <div className="relative z-30">
          <OrderPanel
            orders={activeOrders}
            panelState={orderPanelState}
            onPanelStateChange={setOrderPanelState}
            onConfirmPickup={(orderId) => confirmPickupMutation.mutate(orderId)}
            onConfirmDelivery={(orderId) => confirmDeliveryMutation.mutate(orderId)}
            onStatusChange={(orderId, status) => updateOrderStatusMutation.mutate({ orderId, status })}
            onOpenChat={(orderId) => setChatOpen(true)}
          />
        </div>
      )}

      {/* Bottom Panel - Show when there's no active order */}
      {!order && !orderLoading && (
        <div className="relative z-30">
          <BottomPanel
            isExpanded={panelExpanded}
            onToggleExpand={() => setPanelExpanded(!panelExpanded)}
          />
        </div>
      )}

      {/* Chat Panel */}
      {order && (
        <div className="relative z-40">
          <ChatPanel
            orderId={order.id}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}

      {/* Burger Menu */}
      <div className="relative z-50">
        <BurgerMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onAddRestaurantMarker={() => startAddingMarker("restaurant")}
          onRemoveRestaurantMarker={() => setDeleteRestaurantOpen(true)}
          onAddCustomerMarker={() => startAddingMarker("customer")}
          onRemoveCustomerMarker={() => setDeleteCustomerOpen(true)}
        />
      </div>

      {/* Dialogs - highest z-index */}
      <div className="relative z-50">
        {/* Delivery Confirmation Dialog */}
        <DeliveryConfirmDialog
          open={confirmDeliveryOpen}
          onOpenChange={setConfirmDeliveryOpen}
          orderNumber={order?.orderNumber || ""}
          onConfirm={() => order && confirmDeliveryMutation.mutate(order.id)}
        />

        {/* Marker Dialog for entering name after positioning */}
        <MarkerDialog
          open={showMarkerDialog}
          onOpenChange={(open) => {
            setShowMarkerDialog(open);
            if (!open) {
              setAddingMarkerType(null);
              setMarkerPosition(null);
            }
          }}
          type={addingMarkerType || "restaurant"}
          lat={markerPosition?.lat}
          lng={markerPosition?.lng}
          onSave={handleSaveMarker}
        />

        <DeleteMarkerDialog
          open={deleteRestaurantOpen}
          onOpenChange={setDeleteRestaurantOpen}
          markers={restaurantMarkers.map((m) => ({ id: m.id, name: m.name }))}
          onDelete={(id) => deleteMarkerMutation.mutate(id)}
        />

        <DeleteMarkerDialog
          open={deleteCustomerOpen}
          onOpenChange={setDeleteCustomerOpen}
          markers={customerMarkers.map((m) => ({ id: m.id, name: m.name }))}
          onDelete={(id) => deleteMarkerMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
