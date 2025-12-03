import { useState } from "react";
import { Phone, MessageSquare, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "./StatusBadge";
import type { Order, OrderItem } from "@shared/schema";

interface OrderPanelProps {
  order: Order | null;
  onAccept?: () => void;
  onConfirmDelivery?: () => void;
  onStatusChange?: (status: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function OrderPanel({
  order,
  onAccept,
  onConfirmDelivery,
  onStatusChange,
  isExpanded = false,
  onToggleExpand,
}: OrderPanelProps) {
  const [showItems, setShowItems] = useState(false);

  if (!order) {
    return null;
  }

  const items = (order.items as OrderItem[]) || [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const getPaymentLabel = () => {
    if (order.paymentMethod === "card") return "Безнал";
    if (order.needsChange) return "Получите наличные от клиента (Клиент запросил сдачу)";
    return "Получить наличные";
  };

  const handleCall = () => {
    if (order.customerPhone) {
      window.location.href = `tel:${order.customerPhone}`;
    }
  };

  const handleMessage = () => {
    if (order.customerPhone) {
      window.location.href = `sms:${order.customerPhone}`;
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-30 transition-all duration-300",
        isExpanded ? "max-h-[80vh]" : "max-h-40"
      )}
      data-testid="order-panel"
    >
      {/* Drag Handle */}
      <button
        onClick={onToggleExpand}
        className="w-full py-3 flex items-center justify-center cursor-pointer"
        data-testid="button-toggle-panel"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </button>

      <div className="overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(80vh - 60px)' : 'calc(40vh - 60px)' }}>
        <div className="px-6 pb-6 space-y-4">
          {/* Customer Info Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate" data-testid="text-customer-name">
                {order.customerName}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-customer-address">
                {order.customerAddress}
                {order.houseNumber && `, д. ${order.houseNumber}`}
              </p>
              {(order.apartment || order.floor) && (
                <p className="text-sm text-muted-foreground">
                  {order.apartment && `Номер квартиры: ${order.apartment}`}
                  {order.apartment && order.floor && " • "}
                  {order.floor && `Этаж: ${order.floor}`}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCall}
                className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                data-testid="button-call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={handleMessage}
                className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
                data-testid="button-message"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expand indicator */}
          <button
            onClick={onToggleExpand}
            className="flex items-center justify-center w-full text-muted-foreground"
            data-testid="button-expand"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Order Number */}
              <div className="text-2xl font-bold" data-testid="text-order-number">
                {order.orderNumber}
              </div>

              {/* Order Info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  #{order.orderNumber.slice(-3)} • {order.customerName}
                </span>
              </div>

              {/* Restaurant */}
              <div>
                <h3 className="font-semibold" data-testid="text-restaurant-name">
                  {order.restaurantName}
                </h3>
              </div>

              {/* Order Items Toggle */}
              <button
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-2 text-green-600 font-medium"
                data-testid="button-toggle-items"
              >
                <span>{totalItems} прод.</span>
                {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Order Items List */}
              {showItems && items.length > 0 && (
                <div className="space-y-3 border-t pt-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.quantity || 1}</span>
                        <span className="ml-2">{item.name}</span>
                        {item.modifiers && (
                          <p className="text-muted-foreground text-xs mt-1">{item.modifiers}</p>
                        )}
                      </div>
                      <span className="font-semibold whitespace-nowrap">
                        {item.price.toFixed(2)} ₴
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Info */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Оплата</span>
                  <span className="font-medium">{getPaymentLabel()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center gap-2 py-4 border-t">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-muted-foreground">Общая сумма платежа</span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-order-total">
                {order.totalPrice.toFixed(2)} ₴
              </div>

              {/* Comment */}
              {order.comment && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{order.comment}</p>
                </div>
              )}
            </>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Action Buttons */}
          {order.status === "new" && (
            <Button
              className="w-full h-14 rounded-xl text-base font-semibold bg-green-500 hover:bg-green-600"
              onClick={onAccept}
              data-testid="button-accept-order"
            >
              Принять заказ
            </Button>
          )}

          {order.status === "accepted" && (
            <Button
              className="w-full h-14 rounded-xl text-base font-semibold bg-blue-500 hover:bg-blue-600"
              onClick={() => onStatusChange?.("in_transit")}
              data-testid="button-start-delivery"
            >
              Начать доставку
            </Button>
          )}

          {order.status === "in_transit" && (
            <Button
              className="w-full h-14 rounded-xl text-base font-semibold bg-black hover:bg-gray-900"
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
