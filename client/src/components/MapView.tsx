import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Order, Marker as MarkerType } from "@shared/schema";

interface MapViewProps {
  courierLocation: { lat: number; lng: number } | null;
  order: Order | null;
  markers: MarkerType[];
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapView({ courierLocation, order, markers, onMapClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const savedMarkersRef = useRef<L.Marker[]>([]);

  // Default center (Dnipro, Ukraine)
  const defaultCenter: [number, number] = [48.4647, 35.0462];

  // Custom icon creators
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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(defaultCenter, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add click handler
    map.on("click", (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update courier marker
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

  // Update order markers and route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing order markers
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
      // Add restaurant marker
      restaurantMarkerRef.current = L.marker([order.restaurantLat, order.restaurantLng], {
        icon: createRestaurantIcon(),
      })
        .bindPopup(`<b>${order.restaurantName}</b><br>${order.restaurantAddress}`)
        .addTo(map);

      // Add customer marker
      customerMarkerRef.current = L.marker([order.customerLat, order.customerLng], {
        icon: createCustomerIcon(),
      })
        .bindPopup(`<b>${order.customerName}</b><br>${order.customerAddress}`)
        .addTo(map);

      // Draw route
      const routePoints: L.LatLngExpression[] = [];
      
      if (courierLocation) {
        routePoints.push([courierLocation.lat, courierLocation.lng]);
      }
      routePoints.push([order.restaurantLat, order.restaurantLng]);
      routePoints.push([order.customerLat, order.customerLng]);

      routeLayerRef.current = L.polyline(routePoints, {
        color: "#22C55E",
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Fit bounds to show all markers
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [order, courierLocation]);

  // Update saved markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing saved markers
    savedMarkersRef.current.forEach((marker) => marker.remove());
    savedMarkersRef.current = [];

    // Add saved markers
    markers.forEach((marker) => {
      const icon = marker.type === "restaurant" ? createSavedRestaurantIcon() : createSavedCustomerIcon();
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(`<b>${marker.name}</b><br>${marker.address || ""}`)
        .addTo(map);
      savedMarkersRef.current.push(leafletMarker);
    });
  }, [markers]);

  // Center on courier when location changes
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
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full"
        data-testid="map-container"
      />
    </>
  );
}
