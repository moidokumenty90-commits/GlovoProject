import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapView } from "@/components/MapView";
import { TopBar } from "@/components/TopBar";
import { OrderPanel } from "@/components/OrderPanel";
import { BurgerMenu } from "@/components/BurgerMenu";
import { NavigationButton } from "@/components/NavigationButton";
import { DeliveryConfirmDialog } from "@/components/ConfirmDialog";
import { MarkerDialog, DeleteMarkerDialog } from "@/components/MarkerDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Courier, Order, Marker } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Marker dialogs
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [deleteRestaurantOpen, setDeleteRestaurantOpen] = useState(false);
  const [deleteCustomerOpen, setDeleteCustomerOpen] = useState(false);
  const [mapClickCoords, setMapClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch courier data
  const { data: courier, isLoading: courierLoading } = useQuery<Courier>({
    queryKey: ["/api/courier"],
  });

  // Fetch active order
  const { data: order, isLoading: orderLoading } = useQuery<Order | null>({
    queryKey: ["/api/orders/active"],
    refetchInterval: 5000, // Poll for new orders every 5 seconds
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

  // Accept order mutation
  const acceptOrderMutation = useMutation({
    mutationFn: async () => {
      if (!order) return;
      return await apiRequest("PATCH", `/api/orders/${order.id}/status`, {
        status: "accepted",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      toast({
        title: "Заказ принят",
        description: "Вы приняли заказ к доставке",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!order) return;
      return await apiRequest("PATCH", `/api/orders/${order.id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
    },
  });

  // Confirm delivery mutation
  const confirmDeliveryMutation = useMutation({
    mutationFn: async () => {
      if (!order) return;
      return await apiRequest("PATCH", `/api/orders/${order.id}/status`, {
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
      toast({
        title: "Метка добавлена",
        description: "Новая метка успешно создана",
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
      toast({
        title: "Метка удалена",
      });
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

  // Handle map click for adding markers
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (addRestaurantOpen || addCustomerOpen) {
      setMapClickCoords({ lat, lng });
    }
  }, [addRestaurantOpen, addCustomerOpen]);

  // Handle marker save
  const handleSaveMarker = (type: "restaurant" | "customer") => (data: { name: string; address: string; lat: number; lng: number }) => {
    createMarkerMutation.mutate({ type, ...data });
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
      {/* Map */}
      <div className="absolute inset-0">
        <MapView
          courierLocation={courierLocation}
          order={order || null}
          markers={markers}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Top Bar */}
      <TopBar
        isOnline={courier?.isOnline || false}
        onToggleStatus={() => toggleStatusMutation.mutate()}
        onMenuClick={() => setMenuOpen(true)}
      />

      {/* Navigation Button */}
      {order && order.status !== "delivered" && (
        <div 
          className="absolute right-4 z-20 transition-all duration-300"
          style={{ bottom: panelExpanded ? "calc(80vh + 16px)" : "180px" }}
        >
          <NavigationButton
            restaurantLat={order.restaurantLat}
            restaurantLng={order.restaurantLng}
            customerLat={order.customerLat}
            customerLng={order.customerLng}
          />
        </div>
      )}

      {/* Location Center Button */}
      {!order && courierLocation && (
        <button
          onClick={() => {
            // Center map on courier location - handled by MapView component
          }}
          className="absolute right-4 bottom-24 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-20"
          data-testid="button-center-location"
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
        </button>
      )}

      {/* Order Panel */}
      {order && (
        <OrderPanel
          order={order}
          isExpanded={panelExpanded}
          onToggleExpand={() => setPanelExpanded(!panelExpanded)}
          onAccept={() => acceptOrderMutation.mutate()}
          onConfirmDelivery={() => setConfirmDeliveryOpen(true)}
          onStatusChange={(status) => updateOrderStatusMutation.mutate(status)}
        />
      )}

      {/* Burger Menu */}
      <BurgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAddRestaurantMarker={() => setAddRestaurantOpen(true)}
        onRemoveRestaurantMarker={() => setDeleteRestaurantOpen(true)}
        onAddCustomerMarker={() => setAddCustomerOpen(true)}
        onRemoveCustomerMarker={() => setDeleteCustomerOpen(true)}
      />

      {/* Delivery Confirmation Dialog */}
      <DeliveryConfirmDialog
        open={confirmDeliveryOpen}
        onOpenChange={setConfirmDeliveryOpen}
        orderNumber={order?.orderNumber || ""}
        onConfirm={() => confirmDeliveryMutation.mutate()}
      />

      {/* Marker Dialogs */}
      <MarkerDialog
        open={addRestaurantOpen}
        onOpenChange={setAddRestaurantOpen}
        type="restaurant"
        lat={mapClickCoords?.lat}
        lng={mapClickCoords?.lng}
        onSave={handleSaveMarker("restaurant")}
      />

      <MarkerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        type="customer"
        lat={mapClickCoords?.lat}
        lng={mapClickCoords?.lng}
        onSave={handleSaveMarker("customer")}
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
  );
}
