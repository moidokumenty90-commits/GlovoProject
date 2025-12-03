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
            width: 36px;
            height: 36px;
            background: #22C55E;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
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
            width: 36px;
            height: 36px;
            background: #1F2937;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  const createDraggableIcon = (type: "restaurant" | "customer") => {
    const color = type === "restaurant" ? "#22C55E" : "#1F2937";
    const icon = type === "restaurant" 
      ? `<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/>`
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
            width: 48px;
            height: 48px;
            background: ${color};
            border: 4px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: bounce 0.5s ease-in-out infinite alternate;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              ${icon}
            </svg>
          </div>
          <div style="
            width: 4px;
            height: 20px;
            background: ${color};
            margin-top: -4px;
          "></div>
          <div style="
            width: 12px;
            height: 12px;
            background: ${color};
            border-radius: 50%;
            margin-top: -2px;
            opacity: 0.5;
          "></div>
        </div>
      `,
      iconSize: [48, 80],
      iconAnchor: [24, 80],
    });
  };

  const createSavedRestaurantIcon = () => {
    return L.divIcon({
      className: "saved-restaurant-marker",
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #16A34A;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  };

  const createSavedCustomerIcon = () => {
    return L.divIcon({
      className: "saved-customer-marker",
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #4B5563;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
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
