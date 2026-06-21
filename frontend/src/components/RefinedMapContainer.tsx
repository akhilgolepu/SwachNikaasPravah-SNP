import React from 'react';
import { motion } from 'framer-motion';
import { useSimStore } from '@/lib/simStore';

export const RefinedMapContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const focusedDrainId = useSimStore((s) => s.selectedDrainId);
  const drains = useSimStore((s) => s.drains);
  const focusedAsset = drains.find((d) => d.id === focusedDrainId);
  return (
    <motion.main
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      className="col-span-12 lg:col-span-8 glass-card relative overflow-hidden group h-full flex flex-col"
    >
      {/* Background grid overlay on top of the actual map, but we put it behind the interactive map or let it mix? 
          We'll position it globally to the card so it acts as a container background before map loads. */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1000 1000\\"><defs><pattern id=\\"grid\\" width=\\"50\\" height=\\"50\\" patternUnits=\\"userSpaceOnUse\\"><path d=\\"M 50 0 L 0 0 0 50\\" fill=\\"none\\" stroke=\\"rgba(255,255,255,0.05)\\" stroke-width=\\"1\\"/></pattern></defs><rect width=\\"1000\\" height=\\"1000\\" fill=\\"rgba(5,5,5,0.5)\\"/><rect width=\\"1000\\" height=\\"1000\\" fill=\\"url(%23grid)\\" /></svg>")' }} />

      {/* Ambient Breathing Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-64 h-64 rounded-full bg-[#0066FF]/20 blur-[100px] animate-breathe" />
      </div>

      {/* The actual map component */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* Focused Asset Card */}
      <div className="relative z-20 p-8 h-full flex flex-col justify-end pointer-events-none">
        <div className={`glass-card p-6 w-fit transition-all duration-500 ${focusedAsset ? 'animate-float shadow-2xl pointer-events-auto' : 'opacity-40 blur-[1px]'}`}>
          <p className="text-xs font-mono text-[#00F2FF] mb-2 uppercase tracking-[0.1em]">
            Focused Asset
          </p>
          {focusedAsset ? (
            <>
              <h3 className="text-xl font-bold mb-1 text-white">{focusedAsset.id}</h3>
              <p className="text-sm text-white/60">{focusedAsset.ward}, {focusedAsset.city} · Blockage {focusedAsset.blockage_pct}%</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-1 text-white/40 uppercase tracking-wider">Awaiting Selection</h3>
              <p className="text-sm text-white/30">Select an alert or scan sector</p>
            </>
          )}
        </div>
      </div>

      {/* Gradient Border Animation on hover */}
      <div className="absolute inset-0 rounded-[24px] border-2 border-transparent group-hover:focused-gradient-border pointer-events-none transition-all duration-700 z-30" />
    </motion.main>
  );
};
