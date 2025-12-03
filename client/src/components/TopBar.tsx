import { Menu, Headphones, Bell } from "lucide-react";

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
        className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center"
        data-testid="button-burger-menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Status Badge - Center */}
      <button
        onClick={onToggleStatus}
        className="flex flex-col items-center"
        data-testid="button-toggle-status"
      >
        <span className="text-xs text-gray-600 mb-1">Статус</span>
        <div
          className={`px-5 py-2 rounded-full font-medium text-sm shadow-md ${
            isOnline
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {isOnline ? "Онлайн" : "Офлайн"}
        </div>
      </button>

      {/* Right Buttons */}
      <div className="flex items-center gap-2">
        <button
          className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={onSupportClick}
          className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center"
          data-testid="button-support"
        >
          <Headphones className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
