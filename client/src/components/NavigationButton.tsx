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
    let url = "https://www.google.com/maps/dir/";
    
    if (restaurantLat && restaurantLng) {
      url += `${restaurantLat},${restaurantLng}/`;
    }
    
    if (customerLat && customerLng) {
      url += `${customerLat},${customerLng}`;
    }

    window.open(url, "_blank");
  };

  const isDisabled = !restaurantLat && !customerLat;

  return (
    <button
      onClick={handleNavigate}
      disabled={isDisabled}
      className={cn(
        "w-12 h-12 rounded-full bg-green-500 shadow-lg flex items-center justify-center transition-all",
        isDisabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-green-600 active:scale-95",
        className
      )}
      data-testid="button-navigation"
    >
      {/* Diamond/Navigation Arrow - Glovo style */}
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none"
        className="text-white"
      >
        <path 
          d="M12 3L20 12L12 21L4 12L12 3Z" 
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </button>
  );
}
