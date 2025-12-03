import { Menu, Headphones } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

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
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm shadow-lg">
      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        data-testid="button-menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Status Badge */}
      <StatusBadge isOnline={isOnline} onToggle={onToggleStatus} />

      {/* Support Button */}
      <button
        onClick={onSupportClick}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        data-testid="button-support"
      >
        <Headphones className="w-5 h-5" />
      </button>
    </div>
  );
}
