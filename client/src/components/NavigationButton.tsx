import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonProps {
  restaurantLat?: number;
  restaurantLng?: number;
  customerLat?: number;
  customerLng?: number;
  className?: string;
}

export function NavigationButton({
  restaurantLat,
  restaurantLng,
  customerLat,
  customerLng,
  className,
}: NavigationButtonProps) {
  const handleNavigate = () => {
    // Build Google Maps navigation URL
    let url = "https://www.google.com/maps/dir/";
    
    // If we have restaurant coordinates, start there
    if (restaurantLat && restaurantLng) {
      url += `${restaurantLat},${restaurantLng}/`;
    }
    
    // Add customer destination
    if (customerLat && customerLng) {
      url += `${customerLat},${customerLng}`;
    }

    // Open in new tab or app
    window.open(url, "_blank");
  };

  const isDisabled = !restaurantLat && !customerLat;

  return (
    <button
      onClick={handleNavigate}
      disabled={isDisabled}
      className={cn(
        "w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center transition-all",
        isDisabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-gray-50 active:scale-95",
        className
      )}
      data-testid="button-navigation"
    >
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
        <Navigation className="w-5 h-5 text-white" />
      </div>
    </button>
  );
}
