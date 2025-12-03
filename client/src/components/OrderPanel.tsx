import { useState } from "react";
import { Phone, MessageSquare, ChevronUp, ChevronDown, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@shared/schema";

interface OrderPanelProps {
  order: Order | null;
  onAccept?: () => void;
  onConfirmDelivery?: () => void;
  onStatusChange?: (status: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenChat?: () => void;
}

export function OrderPanel({
  order,
  onAccept,
  onConfirmDelivery,
  onStatusChange,
  isExpanded = false,
  onToggleExpand,
  onOpenChat,
}: OrderPanelProps) {
  const [showItems, setShowItems] = useState(false);

  if (!order) {
    return null;
  }

  const items = (order.items as OrderItem[]) || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

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

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300",
        isExpanded ? "max-h-[85vh]" : "max-h-[50vh]"
      )}
      data-testid="order-panel"
    >
      {/* Drag Handle */}
      <button
        onClick={onToggleExpand}
        className="w-full py-3 flex items-center justify-center cursor-pointer"
        data-testid="button-toggle-panel"
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </button>

      <div 
        className="overflow-y-auto px-5 pb-6" 
        style={{ maxHeight: isExpanded ? 'calc(85vh - 50px)' : 'calc(50vh - 50px)' }}
      >
        {/* Customer Name + Action Buttons Row */}
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900" data-testid="text-customer-name">
            {order.customerName}
          </h2>
          
          {/* Call and Chat Buttons - Glovo style circles */}
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

        {/* Address */}
        <p className="text-gray-600 text-sm mb-1" data-testid="text-customer-address">
          {formatAddress()}
        </p>

        {/* Floor/Apartment info */}
        {(order.floor || order.apartment) && (
          <p className="text-gray-500 text-sm mb-4">
            {order.floor && `Этаж: ${order.floor}`}
            {order.floor && order.apartment && " · "}
            {order.apartment && `Кв: ${order.apartment}`}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Large Order Number */}
        <div className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-order-number">
          {order.orderNumber}
        </div>

        {/* Order Info Line */}
        <p className="text-gray-500 text-sm mb-1">
          #{order.orderNumber.slice(-3)} · {order.customerName}
        </p>

        {/* Restaurant Name */}
        <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-restaurant-name">
          {order.restaurantName}
        </h3>

        {/* Products Toggle - Glovo green style */}
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

        {/* Order Items List */}
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

        {/* Payment Info - only when expanded */}
        {isExpanded && (
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

            {/* Total */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Сумма к оплате</span>
                <span className="text-2xl font-bold text-gray-900" data-testid="text-order-total">
                  {order.totalPrice.toFixed(2)} ₴
                </span>
              </div>
            </div>

            {/* Comment */}
            {order.comment && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-700">{order.comment}</p>
              </div>
            )}
          </>
        )}

        {/* Action Buttons - Glovo style teal color */}
        <div className="mt-4">
          {order.status === "new" && (
            <Button
              className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
              style={{ backgroundColor: "#00A082" }}
              onClick={onAccept}
              data-testid="button-accept-order"
            >
              Принять заказ
            </Button>
          )}

          {order.status === "accepted" && (
            <Button
              className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
              style={{ backgroundColor: "#00A082" }}
              onClick={() => onStatusChange?.("in_transit")}
              data-testid="button-start-delivery"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Начать доставку
            </Button>
          )}

          {order.status === "in_transit" && (
            <Button
              className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
              style={{ backgroundColor: "#00A082" }}
              onClick={onConfirmDelivery}
              data-testid="button-confirm-delivery"
            >
              Подтвердить доставку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
