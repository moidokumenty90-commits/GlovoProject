import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPhase("fading");
    }, 2800);

    const completeTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FFC244" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      data-testid="splash-screen"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-end">
          <motion.svg
            viewBox="0 0 180 50"
            className="h-12"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            data-testid="splash-logo"
          >
            <motion.path
              d="M15 10 C5 10, 0 20, 0 28 C0 40, 10 45, 20 45 C30 45, 35 38, 35 32 L25 32 C25 35, 22 38, 18 38 C12 38, 8 34, 8 28 C8 22, 12 17, 20 17 C25 17, 28 19, 30 22 L37 17 C33 12, 27 10, 20 10 C17 10, 15 10, 15 10 Z"
              fill="#00A082"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
            <motion.path
              d="M45 8 L45 45 L53 45 L53 8 Z"
              fill="#00A082"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ originY: 1 }}
            />
            <motion.path
              d="M75 17 C63 17, 55 25, 55 31 C55 40, 63 45, 75 45 C87 45, 95 37, 95 31 C95 22, 87 17, 75 17 Z M75 38 C68 38, 63 35, 63 31 C63 27, 68 24, 75 24 C82 24, 87 27, 87 31 C87 35, 82 38, 75 38 Z"
              fill="#00A082"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: "spring", stiffness: 200 }}
            />
            <motion.path
              d="M100 17 L115 45 L123 45 L138 17 L129 17 L119 38 L109 17 Z"
              fill="#00A082"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            />
            <motion.path
              d="M155 17 C143 17, 135 25, 135 31 C135 40, 143 45, 155 45 C167 45, 175 37, 175 31 C175 22, 167 17, 155 17 Z M155 38 C148 38, 143 35, 143 31 C143 27, 148 24, 155 24 C162 24, 167 27, 167 31 C167 35, 162 38, 155 38 Z"
              fill="#00A082"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5, type: "spring", stiffness: 200 }}
            />
          </motion.svg>

          <motion.div
            className="ml-1"
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 0.6,
            }}
          >
            <motion.svg
              viewBox="0 0 24 32"
              className="h-10 w-8"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
                delay: 1.2,
              }}
            >
              <motion.path 
                d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"
                fill="#00A082"
              />
              <motion.circle 
                cx="12" 
                cy="12" 
                r="3" 
                fill="#FFC244"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.4,
                }}
              />
            </motion.svg>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-1.5 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          data-testid="splash-loading-dots"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#00A082" }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
