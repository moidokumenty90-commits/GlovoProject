import { useState, useRef, TouchEvent } from "react";
import { Phone, MessageSquare, ChevronUp, ChevronDown, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onOpenChat,
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
        return "h-16";
      case "expanded":
        return "h-[100dvh]";
      default:
        return "h-[50dvh]";
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

  const handleOpenChat = () => {
    onOpenChat?.();
  };

  const formatAddress = () => {
    let addr = order.customerAddress;
    if (order.houseNumber) addr += `, ${order.houseNumber}`;
    return addr;
  };

  const renderActionButton = () => {
    if (order.status === "new") {
      return (
        <Button
          className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
          style={{ backgroundColor: "#00A082" }}
          onClick={onAccept}
          data-testid="button-accept-order"
        >
          Принять заказ
        </Button>
      );
    }

    if (order.status === "accepted") {
      return (
        <Button
          className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
          style={{ backgroundColor: "#00A082" }}
          onClick={() => onStatusChange?.("in_transit")}
          data-testid="button-start-delivery"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Начать доставку
        </Button>
      );
    }

    if (order.status === "in_transit") {
      return (
        <Button
          className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
          style={{ backgroundColor: "#00A082" }}
          onClick={onConfirmDelivery}
          data-testid="button-confirm-delivery"
        >
          Подтвердить доставку
        </Button>
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
      {/* Drag Handle - always captures swipe */}
      <div
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClick={handleToggle}
        className="w-full py-4 flex items-center justify-center cursor-pointer flex-shrink-0 touch-none"
        data-testid="button-toggle-panel"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {panelState === "collapsed" ? (
        <div 
          className="px-5 flex items-center justify-between flex-shrink-0"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div>
            <span className="text-lg font-bold text-gray-900">#{order.orderNumber}</span>
            <span className="text-gray-500 ml-2">· {order.customerName}</span>
          </div>
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </div>
      ) : (
        <>
          <div 
            className="overflow-y-auto px-5 flex-1 overscroll-contain"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900" data-testid="text-customer-name">
                {order.customerName}
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCall}
                  className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  data-testid="button-call"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleOpenChat}
                  className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  data-testid="button-chat"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-1" data-testid="text-customer-address">
              {formatAddress()}
            </p>

            {(order.floor || order.apartment) && (
              <p className="text-gray-500 text-sm mb-4">
                {order.floor && `Этаж: ${order.floor}`}
                {order.floor && order.apartment && " · "}
                {order.apartment && `Кв: ${order.apartment}`}
              </p>
            )}

            <div className="border-t border-gray-100 my-4" />

            <div className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-order-number">
              {order.orderNumber}
            </div>

            <p className="text-gray-500 text-sm mb-1">
              #{order.orderNumber.slice(-3)} · {order.customerName}
            </p>

            <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-restaurant-name">
              {order.restaurantName}
            </h3>

            <button
              onClick={() => setShowItems(!showItems)}
              className="flex items-center gap-1 text-green-500 font-medium text-sm mb-3"
              data-testid="button-toggle-items"
            >
              <span>{totalItems} прод.</span>
              {showItems ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>

            {showItems && items.length > 0 && (
              <div className="space-y-3 mb-4">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-900 font-medium">{item.quantity || 1}</span>
                        <div>
                          <span className="text-gray-900">{item.name}</span>
                          {item.modifiers && (
                            <p className="text-gray-500 text-sm">+ {item.modifiers}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-900 font-medium whitespace-nowrap ml-4">
                      {item.price.toFixed(2)} ₴
                    </span>
                  </div>
                ))}
              </div>
            )}

            {panelState === "expanded" && (
              <>
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Способ оплаты</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod === "card" ? "Безнал" : "Наличные"}
                    </span>
                  </div>
                  {order.needsChange && order.paymentMethod === "cash" && (
                    <p className="text-orange-500 text-sm mt-1">Клиент запросил сдачу</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Сумма к оплате</span>
                    <span className="text-2xl font-bold text-gray-900" data-testid="text-order-total">
                      {order.totalPrice.toFixed(2)} ₴
                    </span>
                  </div>
                </div>

                {order.comment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                    <p className="text-sm text-gray-700">{order.comment}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fixed button at bottom */}
          <div className="flex-shrink-0 px-5 pb-4 pt-3 bg-white border-t border-gray-100">
            {renderActionButton()}
          </div>
        </>
      )}
    </div>
  );
}
