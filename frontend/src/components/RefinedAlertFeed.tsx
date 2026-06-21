import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSimStore, simStore } from '@/lib/simStore';

interface AlertItemProps {
  id: string;
  name: string;
  risk: number;
  status: string;
  location: string;
  onClick: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ id, name, risk, status, location, onClick }) => {
  const isCritical = status === 'critical';
  
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 10 }}
      className={`p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden ${
        isCritical ? 'animate-shimmer' : ''
      }`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-[#FF3B3B] animate-pulse-dot' : 'bg-[#F5A524]'
              }`}
            />
            <span className="text-[10px] font-mono uppercase opacity-60 text-white">{status}</span>
          </div>
          <h4 className="text-sm font-semibold group-hover:text-[#0066FF] transition-colors text-white">
            {name}
          </h4>
          <p className="text-xs text-white/60">{location}</p>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold font-mono ${
              isCritical ? 'text-[#FF3B3B]' : 'text-[#F5A524]'
            }`}
          >
            {risk}
          </span>
          <p className="text-[8px] font-mono opacity-40 text-white uppercase">Risk</p>
        </div>
      </div>
    </motion.div>
  );
};

export const RefinedAlertFeed: React.FC = () => {
  const drains = useSimStore((s) => s.drains);
  const activeAlerts = drains
    .filter((d) => d.status === 'critical' || d.status === 'warning')
    .sort((a, b) => b.risk_index - a.risk_index)
    .slice(0, 10);

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      className="col-span-12 lg:col-span-4 glass-card overflow-hidden flex flex-col h-full relative z-10"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="font-bold uppercase tracking-widest text-xs text-white/40">
          Active Alert Feed
        </h2>
        <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <ChevronDown className="w-4 h-4 text-white/60" />
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {activeAlerts.length === 0 ? (
          <div className="text-center text-white/40 mt-10 text-sm mono">No active alerts</div>
        ) : (
          activeAlerts.map((drain) => (
            <AlertItem
              key={drain.id}
              id={drain.id}
              name={drain.name}
              risk={drain.risk_index}
              status={drain.status}
              location={`${drain.ward}, ${drain.city}`}
              onClick={() => simStore.focusDrain(drain.id)}
            />
          ))
        )}
      </div>
    </motion.aside>
  );
};
