import { X, Plus, Settings, MapPin, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurantMarker?: () => void;
  onRemoveRestaurantMarker?: () => void;
  onAddCustomerMarker?: () => void;
  onRemoveCustomerMarker?: () => void;
}

export function BurgerMenu({
  isOpen,
  onClose,
  onAddRestaurantMarker,
  onRemoveRestaurantMarker,
  onAddCustomerMarker,
  onRemoveCustomerMarker,
}: BurgerMenuProps) {
  const [location] = useLocation();

  const menuItems = [
    {
      type: "link" as const,
      icon: Plus,
      label: "Добавить заказ",
      href: "/add-order",
      testId: "link-add-order",
    },
    {
      type: "link" as const,
      icon: Settings,
      label: "Изменить данные",
      href: "/settings",
      testId: "link-settings",
    },
    { type: "divider" as const },
    {
      type: "action" as const,
      icon: MapPin,
      label: "+ Добавить метку заведения",
      action: onAddRestaurantMarker,
      testId: "button-add-restaurant-marker",
      color: "text-green-600",
    },
    {
      type: "action" as const,
      icon: Trash2,
      label: "- Удалить метку заведения",
      action: onRemoveRestaurantMarker,
      testId: "button-remove-restaurant-marker",
      color: "text-red-600",
    },
    { type: "divider" as const },
    {
      type: "action" as const,
      icon: User,
      label: "+ Добавить метку клиента",
      action: onAddCustomerMarker,
      testId: "button-add-customer-marker",
      color: "text-green-600",
    },
    {
      type: "action" as const,
      icon: Trash2,
      label: "- Удалить метку клиента",
      action: onRemoveCustomerMarker,
      testId: "button-remove-customer-marker",
      color: "text-red-600",
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        data-testid="menu-overlay"
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-background z-50 shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="burger-menu"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            data-testid="button-close-menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-2">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return <div key={index} className="h-px bg-border my-2" />;
            }

            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors",
                    location === item.href && "bg-muted"
                  )}
                  data-testid={item.testId}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  item.action?.();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left",
                  item.color
                )}
                data-testid={item.testId}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-base font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
