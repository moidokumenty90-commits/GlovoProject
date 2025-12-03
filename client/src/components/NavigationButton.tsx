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
        "w-12 h-12 rounded-xl bg-green-500 shadow-lg flex items-center justify-center transition-all",
        isDisabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-green-600 active:scale-95",
        className
      )}
      data-testid="button-navigation"
    >
      {/* Diamond/Compass Arrow Icon */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-white"
      >
        <path 
          d="M12 2L19 12L12 22L5 12L12 2Z" 
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
