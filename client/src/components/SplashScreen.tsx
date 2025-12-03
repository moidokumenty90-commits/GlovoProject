import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Text appears
    const timer1 = setTimeout(() => setAnimationPhase(1), 100);
    
    // Phase 2: Pin bounces in
    const timer2 = setTimeout(() => setAnimationPhase(2), 400);
    
    // Phase 3: Pin settles
    const timer3 = setTimeout(() => setAnimationPhase(3), 800);
    
    // Phase 4: Fade out
    const timer4 = setTimeout(() => setAnimationPhase(4), 2000);
    
    // Complete
    const timer5 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        animationPhase >= 4 ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#FFC244" }}
    >
      {/* Logo container */}
      <div className="flex items-end">
        {/* Glovo text */}
        <svg
          viewBox="0 0 180 50"
          className={`h-12 transition-all duration-500 ${
            animationPhase >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* G */}
          <path
            d="M15 10 C5 10, 0 20, 0 28 C0 40, 10 45, 20 45 C30 45, 35 38, 35 32 L25 32 C25 35, 22 38, 18 38 C12 38, 8 34, 8 28 C8 22, 12 17, 20 17 C25 17, 28 19, 30 22 L37 17 C33 12, 27 10, 20 10 C17 10, 15 10, 15 10 Z"
            fill="#00A082"
          />
          {/* l */}
          <path
            d="M45 8 L45 45 L53 45 L53 8 Z"
            fill="#00A082"
          />
          {/* o */}
          <path
            d="M75 17 C63 17, 55 25, 55 31 C55 40, 63 45, 75 45 C87 45, 95 37, 95 31 C95 22, 87 17, 75 17 Z M75 38 C68 38, 63 35, 63 31 C63 27, 68 24, 75 24 C82 24, 87 27, 87 31 C87 35, 82 38, 75 38 Z"
            fill="#00A082"
          />
          {/* v */}
          <path
            d="M100 17 L115 45 L123 45 L138 17 L129 17 L119 38 L109 17 Z"
            fill="#00A082"
          />
          {/* o */}
          <path
            d="M155 17 C143 17, 135 25, 135 31 C135 40, 143 45, 155 45 C167 45, 175 37, 175 31 C175 22, 167 17, 155 17 Z M155 38 C148 38, 143 35, 143 31 C143 27, 148 24, 155 24 C162 24, 167 27, 167 31 C167 35, 162 38, 155 38 Z"
            fill="#00A082"
          />
        </svg>

        {/* Animated Pin */}
        <div
          className={`ml-1 transition-all ${
            animationPhase >= 2
              ? animationPhase >= 3
                ? "opacity-100 translate-y-0"
                : "opacity-100 animate-bounce-pin"
              : "opacity-0 -translate-y-8"
          }`}
          style={{ 
            transitionDuration: animationPhase >= 3 ? "300ms" : "400ms",
          }}
        >
          <svg
            viewBox="0 0 24 32"
            className="h-10 w-8"
            fill="#00A082"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
            <circle cx="12" cy="12" r="3" fill="#FFC244"/>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes bounce-pin {
          0% {
            transform: translateY(-30px);
          }
          50% {
            transform: translateY(5px);
          }
          70% {
            transform: translateY(-8px);
          }
          85% {
            transform: translateY(2px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-bounce-pin {
          animation: bounce-pin 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
