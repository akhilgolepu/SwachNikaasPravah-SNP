import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StormModeOverlayProps {
  active: boolean;
}

export const StormModeOverlay: React.FC<StormModeOverlayProps> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100] animate-glitch"
        >
          {/* Deep Dark Stormy Theme Overlay */}
          <div className="absolute inset-0 bg-[#020205]/60 backdrop-blur-[2px]" />

          {/* Flash Flood Warning Bar */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 w-full bg-[#FF3B3B] py-2 text-center shadow-[0_0_40px_rgba(255,59,59,0.5)] z-50"
          >
            <span className="font-mono font-bold text-white tracking-widest text-sm animate-pulse">
              ⚠️ FLASH FLOOD WARNING: CRITICAL RISK DETECTED
            </span>
          </motion.div>

          {/* Rain Streaks - Conceptual CSS Implementation */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 50%, transparent)',
              backgroundSize: '20px 200px',
              animation: 'scan-line 0.5s linear infinite'
            }}
          />

          {/* Thunder Flashes */}
          <motion.div
            animate={{
              opacity: [0, 0, 0.8, 0, 0.4, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.9, 0.92, 0.94, 0.96, 1]
            }}
            className="absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
