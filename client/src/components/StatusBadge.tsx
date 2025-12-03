import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  isOnline: boolean;
  onToggle?: () => void;
  className?: string;
}

export function StatusBadge({ isOnline, onToggle, className }: StatusBadgeProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
        isOnline 
          ? "bg-green-500 text-white" 
          : "bg-gray-400 text-white",
        className
      )}
      data-testid="button-status-toggle"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-white animate-pulse" : "bg-white/60"
        )}
      />
      <span>Статус</span>
      <span className="font-bold">{isOnline ? "Онлайн" : "Оффлайн"}</span>
    </button>
  );
}

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "new":
        return { label: "Новый", color: "bg-red-500 text-white" };
      case "accepted":
        return { label: "Принят", color: "bg-yellow-500 text-white" };
      case "in_transit":
        return { label: "В пути", color: "bg-green-500 text-white" };
      case "delivered":
        return { label: "Доставлен", color: "bg-gray-500 text-white" };
      default:
        return { label: status, color: "bg-gray-400 text-white" };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
        config.color,
        className
      )}
      data-testid={`badge-order-status-${status}`}
    >
      {config.label}
    </span>
  );
}
