import { useState, useRef, TouchEvent } from "react";
import { Phone, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@shared/schema";

type PanelState = "collapsed" | "default" | "expanded";

interface OrderPanelProps {
  order: Order | null;
  onAccept?: () => void;
  onConfirmDelivery?: () => void;
  onStatusChange?: (status: string) => void;
  panelState?: PanelState;
  onPanelStateChange?: (state: PanelState) => void;
  onOpenChat?: () => void;
}

export function OrderPanel({
  order,
  onAccept,
  onConfirmDelivery,
  onStatusChange,
  panelState = "default",
  onPanelStateChange,
}: OrderPanelProps) {
  const [showItems, setShowItems] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  if (!order) {
    return null;
  }

  const items = (order.items as OrderItem[]) || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const getPanelHeight = () => {
    switch (panelState) {
      case "collapsed":
        return "h-28";
      case "expanded":
        return "h-[calc(100dvh-8rem)]";
      default:
        return "h-[60dvh]";
    }
  };

  const handleDragStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleDragMove = (e: TouchEvent) => {
    if (isDragging.current) {
      touchEndY.current = e.touches[0].clientY;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 40;

    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      if (swipeDistance > 0) {
        if (panelState === "collapsed") {
          onPanelStateChange?.("default");
        } else if (panelState === "default") {
          onPanelStateChange?.("expanded");
        }
      } else {
        if (panelState === "expanded") {
          onPanelStateChange?.("default");
        } else if (panelState === "default") {
          onPanelStateChange?.("collapsed");
        }
      }
    }
    
    isDragging.current = false;
  };

  const handleToggle = () => {
    if (panelState === "collapsed") {
      onPanelStateChange?.("default");
    } else if (panelState === "default") {
      onPanelStateChange?.("expanded");
    } else {
      onPanelStateChange?.("collapsed");
    }
  };

  const handleCall = () => {
    if (order.customerPhone) {
      window.location.href = `tel:${order.customerPhone}`;
    }
  };

  const formatAddress = () => {
    let addr = order.customerAddress;
    if (order.houseNumber) addr += `, ${order.houseNumber}`;
    return addr;
  };

  const getShortOrderNum = () => {
    const num = order.orderNumber || "";
    return num.slice(-3);
  };

  const renderActionButton = () => {
    if (order.status === "new") {
      return (
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-full text-base font-semibold text-white bg-black"
          data-testid="button-accept-order"
        >
          Прийняти замовлення
        </button>
      );
    }

    if (order.status === "accepted") {
      return (
        <button
          onClick={() => onStatusChange?.("in_transit")}
          className="w-full py-4 rounded-full text-base font-semibold text-white bg-black"
          data-testid="button-start-delivery"
        >
          Розпочати доставку
        </button>
      );
    }

    if (order.status === "in_transit") {
      return (
        <button
          onClick={onConfirmDelivery}
          className="w-full py-4 rounded-full text-base font-semibold text-white bg-black"
          data-testid="button-confirm-delivery"
        >
          Підтвердьте доставку
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300 ease-out flex flex-col",
        getPanelHeight()
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="order-panel"
    >
      {/* Drag Handle */}
      <div
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClick={handleToggle}
        className="w-full py-3 flex items-center justify-center cursor-pointer flex-shrink-0 touch-none"
        data-testid="button-toggle-panel"
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {panelState === "collapsed" ? (
        <div 
          className="px-4 flex items-start justify-between flex-shrink-0"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.customerName}</h2>
            <p className="text-gray-400 text-sm">Доставка</p>
            <p className="text-gray-400 text-sm">#{getShortOrderNum()} • {order.orderNumber}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCall(); }}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#E8F5E9" }}
            data-testid="button-call-collapsed"
          >
            <Phone className="w-5 h-5" style={{ color: "#00A082" }} />
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* Header: Name + Phone */}
            <div className="px-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900" data-testid="text-customer-name">
                    {order.customerName}
                  </h2>
                  <p className="text-gray-400 text-sm">Доставка</p>
                  <p className="text-gray-400 text-sm">
                    #{getShortOrderNum()} • {order.orderNumber}
                  </p>
                </div>
                
                <button
                  onClick={handleCall}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E9" }}
                  data-testid="button-call"
                >
                  <Phone className="w-5 h-5" style={{ color: "#00A082" }} />
                </button>
              </div>
            </div>

            {/* Address */}
            <div className="px-4 pb-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 text-sm" data-testid="text-customer-address">
                {formatAddress()}
                {order.floor && `, поверх ${order.floor}`}
                {order.apartment && `, кв. ${order.apartment}`}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-4" />

            {/* Order Details */}
            <div className="px-4 py-4">
              {/* Large Order Number */}
              <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight" data-testid="text-order-number">
                {order.orderNumber}
              </div>
              
              {/* Order info line */}
              <p className="text-gray-500 text-sm mb-0.5">
                #{getShortOrderNum()} • {order.customerName}
              </p>
              
              {/* Restaurant name */}
              <p className="font-semibold text-gray-900 text-base mb-4" data-testid="text-restaurant-name">
                {order.restaurantName}
              </p>

              {/* Products toggle */}
              <button
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-1 mb-2"
                data-testid="button-toggle-items"
              >
                <span className="font-medium" style={{ color: "#00A082" }}>
                  {totalItems} продуктів
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showItems && "rotate-180"
                  )}
                  style={{ color: "#00A082" }}
                />
              </button>

              {/* Items list */}
              {showItems && items.length > 0 && (
                <div className="space-y-2 mb-4 pl-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="text-gray-500">{item.quantity || 1}x</span>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-gray-500">{item.price.toFixed(2)} ₴</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-4" />

            {/* Payment */}
            <div className="px-4 py-4">
              <p className="text-gray-400 text-sm mb-2">Оплата</p>
              <button
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: order.paymentMethod === "card" ? "#E8F5E9" : "#FFF3E0",
                  color: order.paymentMethod === "card" ? "#00A082" : "#E65100"
                }}
                data-testid="button-payment-status"
              >
                {order.paymentMethod === "card" ? "Сплачено онлайн" : "Готівка при отриманні"}
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-4" />

            {/* Client unavailable button */}
            <button 
              className="w-full px-4 py-4 flex items-center justify-between"
              data-testid="button-client-unavailable"
            >
              <span className="text-gray-900 font-medium">Клієнт недоступний</span>
              <ChevronRight className="w-5 h-5" style={{ color: "#00A082" }} />
            </button>

            {/* Extra space for expanded view */}
            {panelState === "expanded" && (
              <>
                <div className="h-px bg-gray-100 mx-4" />
                
                {/* Total */}
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Сума замовлення</span>
                    <span className="text-xl font-bold text-gray-900" data-testid="text-order-total">
                      {order.totalPrice.toFixed(2)} ₴
                    </span>
                  </div>
                </div>

                {/* Comment if exists */}
                {order.comment && (
                  <>
                    <div className="h-px bg-gray-100 mx-4" />
                    <div className="px-4 py-4">
                      <p className="text-gray-400 text-sm mb-1">Коментар</p>
                      <p className="text-gray-700 text-sm">{order.comment}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Fixed button at bottom */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white">
            {renderActionButton()}
          </div>
        </>
      )}
    </div>
  );
}
