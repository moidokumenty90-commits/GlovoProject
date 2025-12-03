import { X, Plus, Settings, MapPin, Trash2, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        data-testid="menu-overlay"
      />

      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-background z-50 shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="burger-menu"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Меню</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            data-testid="button-close-menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-2 flex flex-col h-[calc(100%-64px)]">
          <div className="flex-1">
            <Link
              href="/add-order"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors",
                location === "/add-order" && "bg-muted"
              )}
              data-testid="link-add-order"
            >
              <Plus className="w-5 h-5" />
              <span className="text-base font-medium">Добавить заказ</span>
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors",
                location === "/settings" && "bg-muted"
              )}
              data-testid="link-settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-base font-medium">Изменить данные</span>
            </Link>

            <div className="h-px bg-border my-2" />

            <button
              onClick={() => {
                onAddRestaurantMarker?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left text-green-600"
              data-testid="button-add-restaurant-marker"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-base font-medium">+ Добавить метку заведения</span>
            </button>

            <button
              onClick={() => {
                onRemoveRestaurantMarker?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left text-red-600"
              data-testid="button-remove-restaurant-marker"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-base font-medium">- Удалить метку заведения</span>
            </button>

            <div className="h-px bg-border my-2" />

            <button
              onClick={() => {
                onAddCustomerMarker?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left text-green-600"
              data-testid="button-add-customer-marker"
            >
              <User className="w-5 h-5" />
              <span className="text-base font-medium">+ Добавить метку клиента</span>
            </button>

            <button
              onClick={() => {
                onRemoveCustomerMarker?.();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left text-red-600"
              data-testid="button-remove-customer-marker"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-base font-medium">- Удалить метку клиента</span>
            </button>
          </div>

          <div className="border-t mt-auto">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors text-left text-muted-foreground"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base font-medium">
                {isLoggingOut ? "Выход..." : "Выйти из системы"}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
