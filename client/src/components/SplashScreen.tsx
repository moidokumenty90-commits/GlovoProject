import { useState, useEffect } from "react";
import { Truck } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Logo appears
    const timer1 = setTimeout(() => setAnimationPhase(1), 100);
    
    // Phase 2: Logo pulses
    const timer2 = setTimeout(() => setAnimationPhase(2), 600);
    
    // Phase 3: Fade out
    const timer3 = setTimeout(() => setAnimationPhase(3), 1800);
    
    // Complete
    const timer4 = setTimeout(() => onComplete(), 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-green-500 transition-opacity duration-500 ${
        animationPhase >= 3 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-400/30 transition-all duration-1000 ${
            animationPhase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-green-400/40 transition-all duration-700 delay-200 ${
            animationPhase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-green-400/50 transition-all duration-500 delay-300 ${
            animationPhase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </div>

      {/* Logo container */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
          animationPhase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
        } ${animationPhase >= 2 ? "animate-bounce-subtle" : ""}`}
      >
        {/* Logo circle with truck icon */}
        <div className="w-28 h-28 rounded-full bg-white shadow-2xl flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center">
            <Truck className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* App name */}
        <h1 
          className={`text-3xl font-bold text-white tracking-wider transition-all duration-500 delay-300 ${
            animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          COURIER
        </h1>
        
        {/* Tagline */}
        <p 
          className={`text-white/80 text-sm mt-2 transition-all duration-500 delay-500 ${
            animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Быстрая доставка
        </p>
      </div>

      {/* Loading dots */}
      <div 
        className={`absolute bottom-20 flex gap-2 transition-opacity duration-300 delay-700 ${
          animationPhase >= 2 && animationPhase < 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot-1" />
        <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot-2" />
        <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot-3" />
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
        @keyframes pulse-dot-1 {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          33% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse-dot-2 {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes pulse-dot-3 {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          66% { opacity: 1; transform: scale(1.2); }
        }
        .animate-pulse-dot-1 {
          animation: pulse-dot-1 1.2s ease-in-out infinite;
        }
        .animate-pulse-dot-2 {
          animation: pulse-dot-2 1.2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        .animate-pulse-dot-3 {
          animation: pulse-dot-3 1.2s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
