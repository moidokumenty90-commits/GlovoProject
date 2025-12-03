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
        className={`flex flex-col items-center px-5 py-2 rounded-full shadow-sm ${
          isOnline
            ? "bg-white border border-gray-200"
            : "bg-white border-2 border-teal-400"
        }`}
        data-testid="button-toggle-status"
      >
        {isOnline ? (
          <>
            <span className="text-[10px] text-gray-400 font-medium">
              Статус
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <span className="font-semibold text-sm text-gray-800">
                Онлайн
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-gray-500">
              Оффлайн
            </span>
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
        )}
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
