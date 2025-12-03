import { Menu, Headphones } from "lucide-react";

interface TopBarProps {
  isOnline: boolean;
  onToggleStatus: () => void;
  onMenuClick: () => void;
  onSupportClick?: () => void;
}

export function TopBar({
  isOnline,
  onToggleStatus,
  onMenuClick,
  onSupportClick,
}: TopBarProps) {
  return (
    <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4">
      {/* Menu Button - Left */}
      <button
        onClick={onMenuClick}
        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
        data-testid="button-burger-menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Status Badge - Center (Glovo style) */}
      <button
        onClick={onToggleStatus}
        className={`flex flex-col items-center px-5 py-2 rounded-full shadow-md ${
          isOnline
            ? "bg-green-500"
            : "bg-gray-200"
        }`}
        data-testid="button-toggle-status"
      >
        <span className={`text-[10px] font-medium ${isOnline ? "text-white/80" : "text-gray-500"}`}>
          Статус
        </span>
        <span className={`font-semibold text-sm ${isOnline ? "text-white" : "text-gray-600"}`}>
          {isOnline ? "Онлайн" : "Офлайн"}
        </span>
      </button>

      {/* Support Button - Right */}
      <button
        onClick={onSupportClick}
        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center"
        data-testid="button-support"
      >
        <Headphones className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
}
