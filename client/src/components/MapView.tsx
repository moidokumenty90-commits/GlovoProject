import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Order, Marker as MarkerType } from "@shared/schema";

interface MapViewProps {
  courierLocation: { lat: number; lng: number } | null;
  order: Order | null;
  markers: MarkerType[];
  draggableMarker?: {
    type: "restaurant" | "customer";
    onPositionChange: (lat: number, lng: number) => void;
  } | null;
}

export interface MapViewRef {
  getCenter: () => { lat: number; lng: number } | null;
  centerOnLocation: (lat: number, lng: number) => void;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(({ 
  courierLocation, 
  order, 
  markers,
  draggableMarker,
}, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const savedMarkersRef = useRef<L.Marker[]>([]);
  const draggableMarkerRef = useRef<L.Marker | null>(null);

  const defaultCenter: [number, number] = [48.4647, 35.0462];

  useImperativeHandle(ref, () => ({
    getCenter: () => {
      const map = mapInstanceRef.current;
      if (!map) return null;
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    },
    centerOnLocation: (lat: number, lng: number) => {
      const map = mapInstanceRef.current;
      if (map) {
        map.setView([lat, lng], 16, { animate: true });
      }
    },
  }));

  const createCourierIcon = () => {
    return L.divIcon({
      className: "courier-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createRestaurantIcon = () => {
    return L.divIcon({
      className: "restaurant-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: #374151;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div style="
            width: 18px;
            height: 18px;
            background: #00A082;
            border: 2px solid white;
            border-radius: 50%;
            margin-top: -9px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      iconSize: [44, 62],
      iconAnchor: [22, 62],
    });
  };

  const createCustomerIcon = () => {
    return L.divIcon({
      className: "customer-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: #00A082;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style="
            width: 18px;
            height: 18px;
            background: #1F2937;
            border: 2px solid white;
            border-radius: 50%;
            margin-top: -9px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 62],
      iconAnchor: [22, 62],
    });
  };

  const createDraggableIcon = (type: "restaurant" | "customer") => {
    const mainColor = type === "restaurant" ? "#374151" : "#00A082";
    const dotColor = type === "restaurant" ? "#00A082" : "#1F2937";
    const icon = type === "restaurant" 
      ? `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`
      : `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;
    
    return L.divIcon({
      className: "draggable-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
        ">
          <div style="
            width: 52px;
            height: 52px;
            background: ${mainColor};
            border: 4px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 0.5s ease-in-out infinite alternate;
          ">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              ${icon}
            </svg>
          </div>
          <div style="
            width: 22px;
            height: 22px;
            background: ${dotColor};
            border: 3px solid white;
            border-radius: 50%;
            margin-top: -11px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${type === "customer" ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>` : ""}
          </div>
        </div>
      `,
      iconSize: [52, 74],
      iconAnchor: [26, 74],
    });
  };

  const createSavedRestaurantIcon = () => {
    return L.divIcon({
      className: "saved-restaurant-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: #374151;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div style="
            width: 16px;
            height: 16px;
            background: #00A082;
            border: 2px solid white;
            border-radius: 50%;
            margin-top: -8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 56],
    });
  };

  const createSavedCustomerIcon = () => {
    return L.divIcon({
      className: "saved-customer-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: #00A082;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style="
            width: 16px;
            height: 16px;
            background: #1F2937;
            border: 2px solid white;
            border-radius: 50%;
            margin-top: -8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 56],
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(defaultCenter, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (courierLocation) {
      if (courierMarkerRef.current) {
        courierMarkerRef.current.setLatLng([courierLocation.lat, courierLocation.lng]);
      } else {
        courierMarkerRef.current = L.marker([courierLocation.lat, courierLocation.lng], {
          icon: createCourierIcon(),
        }).addTo(map);
      }
    } else if (courierMarkerRef.current) {
      courierMarkerRef.current.remove();
      courierMarkerRef.current = null;
    }
  }, [courierLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (restaurantMarkerRef.current) {
      restaurantMarkerRef.current.remove();
      restaurantMarkerRef.current = null;
    }
    if (customerMarkerRef.current) {
      customerMarkerRef.current.remove();
      customerMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (order && order.status !== "delivered") {
      restaurantMarkerRef.current = L.marker([order.restaurantLat, order.restaurantLng], {
        icon: createRestaurantIcon(),
      })
        .bindPopup(`<b>${order.restaurantName}</b><br>${order.restaurantAddress}`)
        .addTo(map);

      customerMarkerRef.current = L.marker([order.customerLat, order.customerLng], {
        icon: createCustomerIcon(),
      })
        .bindPopup(`<b>${order.customerName}</b><br>${order.customerAddress}`)
        .addTo(map);

      // Fit bounds to show all markers
      const points: L.LatLngExpression[] = [
        [order.restaurantLat, order.restaurantLng],
        [order.customerLat, order.customerLng],
      ];
      if (courierLocation) {
        points.push([courierLocation.lat, courierLocation.lng]);
      }
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [order, courierLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    savedMarkersRef.current.forEach((marker) => marker.remove());
    savedMarkersRef.current = [];

    markers.forEach((marker) => {
      const icon = marker.type === "restaurant" ? createSavedRestaurantIcon() : createSavedCustomerIcon();
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(`<b>${marker.name}</b><br>${marker.address || ""}`)
        .addTo(map);
      savedMarkersRef.current.push(leafletMarker);
    });
  }, [markers]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (draggableMarkerRef.current) {
      draggableMarkerRef.current.remove();
      draggableMarkerRef.current = null;
    }

    if (draggableMarker) {
      const center = map.getCenter();
      const marker = L.marker([center.lat, center.lng], {
        icon: createDraggableIcon(draggableMarker.type),
        draggable: true,
        autoPan: true,
      }).addTo(map);

      draggableMarker.onPositionChange(center.lat, center.lng);

      marker.on("drag", () => {
        const pos = marker.getLatLng();
        draggableMarker.onPositionChange(pos.lat, pos.lng);
      });

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        draggableMarker.onPositionChange(pos.lat, pos.lng);
      });

      draggableMarkerRef.current = marker;
    }
  }, [draggableMarker]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !courierLocation || order) return;

    map.setView([courierLocation.lat, courierLocation.lng], map.getZoom());
  }, [courierLocation, order]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-8px);
          }
        }
        .leaflet-container {
          font-family: inherit;
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-control-container {
          z-index: 10 !important;
        }
        .draggable-marker {
          cursor: grab;
        }
        .draggable-marker:active {
          cursor: grabbing;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full"
        data-testid="map-container"
      />
    </>
  );
});

MapView.displayName = "MapView";
