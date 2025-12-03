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
    <div 
      className="absolute left-0 right-0 z-20 flex items-center justify-between px-4"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.5rem + 2vh)' }}
    >
      {/* Menu Button - Left */}
      <button
        onClick={onMenuClick}
        className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center"
        data-testid="button-burger-menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Status Badge - Center (Glovo style) */}
      <button
        onClick={onToggleStatus}
        className={`relative flex flex-col items-center px-5 py-2 rounded-full shadow-sm backdrop-blur-sm ${
          isOnline
            ? "bg-white/95 border border-gray-200"
            : "bg-white/95 border-2 border-teal-400"
        }`}
        data-testid="button-toggle-status"
      >
        {isOnline && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
        {isOnline ? (
          <>
            <span className="text-[10px] text-gray-400 font-medium">
              Статус
            </span>
            <span className="font-semibold text-sm text-gray-800">
              Онлайн
            </span>
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
        className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center"
        data-testid="button-support"
      >
        <Headphones className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
}
