import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';

interface RefinedHeaderProps {
  stormMode: boolean;
  setStormMode: (mode: boolean) => void;
}

export const RefinedHeader: React.FC<RefinedHeaderProps> = ({ stormMode, setStormMode }) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card p-6 flex justify-between items-center z-50 relative mb-8"
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight glow-text">
          SwachNikaasPravah-SNP
        </h1>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex gap-8 text-sm font-medium text-white/60">
        {[
          { label: 'Dashboard', to: '/' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Dispatch', to: '/dispatch' }
        ].map((item) => (
          <Link 
            key={item.label} 
            to={item.to}
            className="hover:text-white transition-colors relative group py-1"
            activeProps={{ className: 'text-white font-bold' }}
          >
            {item.label}
            {/* Animated Underline */}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#0066FF] transition-all duration-300 ease-out group-hover:w-full" />
          </Link>
        ))}
      </nav>

      {/* Actions & Status Badge */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setStormMode(!stormMode)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            stormMode
              ? 'bg-[#FF3B3B] text-white shadow-[0_0_20px_rgba(255,59,59,0.5)]'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          }`}
        >
          {stormMode ? 'DISABLE STORM MODE' : 'SIMULATE STORM'}
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17C964]/10 border border-[#17C964]/20">
          <div className="w-2 h-2 rounded-full bg-[#17C964] animate-pulse" />
          <span className="text-xs font-mono text-[#17C964] uppercase">Live System</span>
        </div>
      </div>
    </motion.header>
  );
};
