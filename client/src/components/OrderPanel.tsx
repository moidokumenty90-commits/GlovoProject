import { useState, useRef, TouchEvent } from "react";
import { Phone, MessageSquare, ChevronDown, ChevronRight, X, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@shared/schema";

type PanelState = "collapsed" | "default" | "expanded";

interface OrderPanelProps {
  orders: Order[];
  onConfirmPickup?: (orderId: string) => void;
  onConfirmDelivery?: (orderId: string) => void;
  onStatusChange?: (orderId: string, status: string) => void;
  panelState?: PanelState;
  onPanelStateChange?: (state: PanelState) => void;
  onOpenChat?: (orderId: string) => void;
}

export function OrderPanel({
  orders,
  onConfirmPickup,
  onConfirmDelivery,
  onStatusChange,
  panelState = "default",
  onPanelStateChange,
  onOpenChat,
}: OrderPanelProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [popupExpanded, setPopupExpanded] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const popupTouchStartY = useRef<number>(0);
  const popupTouchEndY = useRef<number>(0);
  const popupIsDragging = useRef<boolean>(false);

  if (!orders.length) {
    return null;
  }

  const isPickupPhase = orders.some(o => o.status === "new" || o.status === "accepted");
  const isDeliveryPhase = orders.some(o => o.status === "in_transit");
  
  const firstOrder = orders[0];
  const selectedOrder = selectedOrderId ? orders.find(o => o.id === selectedOrderId) : null;

  const getPanelHeight = () => {
    switch (panelState) {
      case "collapsed":
        return "h-28";
      case "expanded":
        return "h-[calc(95dvh-5rem)]";
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

  const handleCall = (phone?: string | null) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getShortOrderNum = (order: Order) => {
    const num = order.orderNumber || "";
    return num.slice(-3);
  };

  const getTotalItems = (order: Order) => {
    const items = (order.items as OrderItem[]) || [];
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Готов";
      case "accepted": return "Готов";
      case "in_transit": return "В дорозі";
      case "delivered": return "Доставлено";
      default: return status;
    }
  };

  const pluralizeOrders = (count: number) => {
    if (count === 1) return "заказ";
    if (count >= 2 && count <= 4) return "заказа";
    return "заказов";
  };

  const handlePopupDragStart = (e: TouchEvent) => {
    popupTouchStartY.current = e.touches[0].clientY;
    popupTouchEndY.current = e.touches[0].clientY;
    popupIsDragging.current = true;
  };

  const handlePopupDragMove = (e: TouchEvent) => {
    if (popupIsDragging.current) {
      popupTouchEndY.current = e.touches[0].clientY;
    }
  };

  const handlePopupDragEnd = () => {
    if (!popupIsDragging.current) return;
    
    const swipeDistance = popupTouchStartY.current - popupTouchEndY.current;
    const minSwipeDistance = 40;

    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      if (swipeDistance > 0) {
        setPopupExpanded(true);
      } else {
        if (popupExpanded) {
          setPopupExpanded(false);
        } else {
          setSelectedOrderId(null);
          setPopupExpanded(false);
        }
      }
    }
    
    popupIsDragging.current = false;
  };

  const renderOrderDetailPopup = () => {
    if (!selectedOrder) return null;

    const items = (selectedOrder.items as OrderItem[]) || [];
    const totalItems = getTotalItems(selectedOrder);

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-black/40"
          onClick={() => { setSelectedOrderId(null); setPopupExpanded(false); }}
        />
        <div 
          className={cn(
            "relative w-full bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300 transition-all flex flex-col",
            popupExpanded ? "h-[95vh]" : "h-[70vh]"
          )}
        >
          <div
            onTouchStart={handlePopupDragStart}
            onTouchMove={handlePopupDragMove}
            onTouchEnd={handlePopupDragEnd}
            onClick={() => setPopupExpanded(!popupExpanded)}
            className="w-full py-3 flex items-center justify-center cursor-pointer flex-shrink-0 touch-none"
            data-testid="button-toggle-popup"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <button
            onClick={() => { setSelectedOrderId(null); setPopupExpanded(false); }}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
            data-testid="button-close-order-detail"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>

          <div className="p-6 pt-2 overflow-y-auto flex-1">
            {/* Position 1: Status badge - on top */}
            <div className="mb-2">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: "#E8F5E9", color: "#00A082" }}
              >
                {getOrderStatusLabel(selectedOrder.status)}
              </span>
            </div>

            {/* Position 2: Order number - directly below */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 mb-4"
              style={{ borderColor: "#00A082" }}
            >
              <span className="text-2xl font-bold" style={{ color: "#000000" }}>
                #{getShortOrderNum(selectedOrder)}
              </span>
              <Maximize2 className="w-4 h-4" style={{ color: "#00A082" }} />
            </div>

            {/* Position 3: Order info */}
            <p className="text-base mb-6 font-bold" style={{ color: "#000000" }}>
              {selectedOrder.orderNumber} - #{getShortOrderNum(selectedOrder)} - {selectedOrder.customerName}
            </p>

            {/* Position 4: Products count - right aligned */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-1"
                data-testid="button-toggle-items-popup"
              >
                <span className="font-semibold text-lg" style={{ color: "#00A082" }}>
                  {totalItems} прод.
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showItems && "rotate-180"
                  )}
                  style={{ color: "#00A082" }}
                />
              </button>
            </div>

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

            <div className="h-px bg-gray-100 my-4" />

            <p className="text-gray-400 text-sm mb-1">Оплата</p>
            <p className="text-gray-900 mb-6">
              {selectedOrder.paymentMethod === "card" 
                ? "Оплата в пункте получения не требуется" 
                : "Готівка при отриманні"}
            </p>

            <button
              onClick={() => {
                if (selectedOrder.status === "new") {
                  onStatusChange?.(selectedOrder.id, "accepted");
                } else if (selectedOrder.status === "accepted") {
                  onConfirmPickup?.(selectedOrder.id);
                } else if (selectedOrder.status === "in_transit") {
                  onConfirmDelivery?.(selectedOrder.id);
                }
                setSelectedOrderId(null);
              }}
              className="w-full py-4 rounded-full text-base font-semibold text-white bg-black"
              data-testid="button-confirm-order"
            >
              {selectedOrder.status === "new" 
                ? "Прийняти замовлення" 
                : selectedOrder.status === "in_transit" 
                  ? "Подтвердить доставку" 
                  : "Подтвердить получение"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPickupPanel = () => {
    return (
      <>
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="px-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900" data-testid="text-restaurant-name">
                  {firstOrder.restaurantName}
                </h2>
                <p className="text-gray-400 text-sm">
                  {orders.length} {pluralizeOrders(orders.length)}
                </p>
              </div>
              
              <button
                onClick={() => handleCall(firstOrder.customerPhone)}
                className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#4B5563" }}
                data-testid="button-call-restaurant"
              >
                <Phone className="w-5 h-5" style={{ color: "#000000" }} />
              </button>
            </div>
          </div>

          <p className="px-4 text-gray-900 font-semibold text-sm mb-4" data-testid="text-restaurant-address">
            {firstOrder.restaurantAddress}
          </p>

          {/* Divider line with shadow */}
          <div 
            className="w-full mb-4"
            style={{ 
              height: "1px",
              backgroundColor: "#9CA3AF",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.39)"
            }}
          />

          {firstOrder.restaurantCompany && (
            <p className="px-4 text-gray-500 text-sm mb-3">
              Компания: {firstOrder.restaurantCompany}
            </p>
          )}

          {firstOrder.restaurantComment && (
            <div className="px-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">⇄</span>
                <div>
                  <p className="text-gray-600 text-sm">{firstOrder.restaurantComment}</p>
                  <button className="text-sm font-medium" style={{ color: "#00A082" }}>
                    Перевести
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="px-4">
            {orders.map((order, index) => (
              <div key={order.id}>
                {/* Separator line between orders */}
                {index > 0 && (
                  <div 
                    className="w-full my-5"
                    style={{ 
                      height: "1px",
                      backgroundColor: "#D1D5DB"
                    }}
                  />
                )}
                
                <div className="flex items-start gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: "#00A082", color: "white" }}
                    >
                      {index + 1}
                    </span>
                    <div 
                      className="w-0.5 h-20 mt-1" 
                      style={{ 
                        backgroundImage: "repeating-linear-gradient(to bottom, #000000 0px, #000000 4px, transparent 4px, transparent 8px)"
                      }} 
                    />
                  </div>

                  <div className="flex-1">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                      style={{ backgroundColor: "#E8F5E9", color: "#00A082" }}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>

                    <div className="flex items-center justify-between">
                      <div>
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 mb-1"
                          style={{ borderColor: "#00A082" }}
                        >
                          <span className="text-lg font-bold" style={{ color: "#000000" }}>
                            #{getShortOrderNum(order)}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" style={{ color: "#00A082" }} />
                        </div>
                        <p className="text-xs font-bold" style={{ color: "#000000" }}>
                          {order.orderNumber} - #{getShortOrderNum(order)} - {order.customerName}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowItems(false);
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#00A082" }}
                        data-testid={`button-open-order-${order.id}`}
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderDeliveryPanel = () => {
    const order = orders.find(o => o.status === "in_transit") || firstOrder;
    const items = (order.items as OrderItem[]) || [];
    const totalItems = getTotalItems(order);

    const formatAddress = () => {
      let addr = order.customerAddress;
      if (order.houseNumber) addr += `, ${order.houseNumber}`;
      return addr;
    };

    return (
      <>
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="px-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900" data-testid="text-customer-name">
                  {order.customerName}
                </h2>
                <p className="text-gray-500 text-sm" data-testid="text-customer-address">
                  {formatAddress()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleCall(order.customerPhone)}
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-white"
                  style={{ border: "1.5px solid #6B7280" }}
                  data-testid="button-call-customer"
                >
                  <Phone className="w-5 h-5" style={{ color: "#000000" }} />
                </button>
                <button
                  onClick={() => onOpenChat?.(order.id)}
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-white"
                  style={{ border: "1.5px solid #6B7280" }}
                  data-testid="button-chat-customer"
                >
                  <MessageSquare className="w-5 h-5" style={{ color: "#000000" }} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider line with shadow after customer info */}
          <div 
            className="w-full mb-4"
            style={{ 
              height: "1px",
              backgroundColor: "#9CA3AF",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.30)"
            }}
          />

          {order.buildingInfo && (
            <p className="px-4 text-gray-500 text-sm mb-3">
              Здание: {order.buildingInfo}
            </p>
          )}

          {/* Gray separator line after building info */}
          <div className="w-full mb-2" style={{ height: "0.5px", backgroundColor: "#D1D5DB" }} />

          <div className="px-4 py-4">
            <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight" data-testid="text-order-number">
              {order.orderNumber}
            </div>
            
            <p className="text-gray-500 text-sm mb-0.5">
              #{getShortOrderNum(order)} · {order.customerName}
            </p>
            
            <p className="font-semibold text-gray-900 text-base mb-4" data-testid="text-restaurant-name-delivery">
              {order.restaurantName}
            </p>

            <div className="flex justify-start">
              <button
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-1 mb-2"
                data-testid="button-toggle-items"
              >
                <span className="font-medium" style={{ color: "#00A082" }}>
                  {totalItems} прод.
                </span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showItems && "rotate-180"
                  )}
                  style={{ color: "#00A082" }}
                />
              </button>
            </div>

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

          {/* Gray separator line after products */}
          <div className="h-px w-full" style={{ backgroundColor: "#9CA3AF" }} />

          <div className="px-4 py-4">
            <p className="text-gray-400 text-sm mb-1">Оплата</p>
            <p className="text-gray-900">
              {order.paymentMethod === "card" ? "Оплачено онлайн" : "Готівка при отриманні"}
            </p>
          </div>

          <div className="h-px bg-gray-100 mx-4" />

          <button 
            className="w-full px-4 py-4 flex items-center justify-between"
            data-testid="button-client-unavailable"
          >
            <span className="font-bold" style={{ color: "#000000" }}>Клиент недоступен</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white">
          <button
            onClick={() => onConfirmDelivery?.(order.id)}
            className="w-full py-4 rounded-full text-base font-semibold text-white bg-black"
            data-testid="button-confirm-delivery"
          >
            Подтвердить доставку
          </button>
        </div>
      </>
    );
  };

  const renderCollapsedContent = () => {
    if (isDeliveryPhase) {
      const order = orders.find(o => o.status === "in_transit") || firstOrder;
      return (
        <div 
          className="px-4 flex items-start justify-between flex-shrink-0"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.customerName}</h2>
            <p className="text-gray-400 text-sm">Доставка</p>
            <p className="text-gray-400 text-sm">#{getShortOrderNum(order)} • {order.orderNumber}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCall(order.customerPhone); }}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#E8F5E9" }}
            data-testid="button-call-collapsed"
          >
            <Phone className="w-5 h-5" style={{ color: "#00A082" }} />
          </button>
        </div>
      );
    }

    return (
      <div 
        className="px-4 flex items-start justify-between flex-shrink-0"
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">{firstOrder.restaurantName}</h2>
          <p className="text-gray-400 text-sm">{orders.length} {pluralizeOrders(orders.length)}</p>
          <p className="text-gray-400 text-sm truncate max-w-[250px]">{firstOrder.restaurantAddress}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleCall(firstOrder.customerPhone); }}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#E8F5E9" }}
          data-testid="button-call-collapsed"
        >
          <Phone className="w-5 h-5" style={{ color: "#00A082" }} />
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300 ease-out flex flex-col",
          getPanelHeight()
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        data-testid="order-panel"
      >
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
          renderCollapsedContent()
        ) : (
          isDeliveryPhase ? renderDeliveryPanel() : renderPickupPanel()
        )}
      </div>

      {selectedOrderId && renderOrderDetailPopup()}
    </>
  );
}
