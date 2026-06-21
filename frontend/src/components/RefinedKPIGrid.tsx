import React from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  delay: number;
  isFocus?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, color, delay, isFocus = false }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      className={`glass-card p-8 relative overflow-hidden group ${
        isFocus ? 'ring-2 ring-[#FF3B3B]/30' : ''
      }`}
    >
      {/* Internal Aura/Glow */}
      <div
        className="kpi-glow transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />

      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-5xl font-bold tracking-tighter" style={{ color }}>
          {value}
        </h3>
        <span className="text-xs font-mono opacity-40">UNIT</span>
      </div>
      <p className="text-xs text-white/40 mt-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        {sub}
      </p>
    </motion.div>
  );
};

export const RefinedKPIGrid: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
      <KPICard label="Monitored Drains" value="12" sub="2 Cities" color="#0066FF" delay={0.1} />
      <KPICard label="Critical Alerts" value="04" sub="Immediate Action" color="#FF3B3B" delay={0.2} isFocus />
      <KPICard label="Warnings" value="04" sub="Monitor Closely" color="#F5A524" delay={0.3} />
      <KPICard label="Crews Live" value="08" sub="On Mission" color="#00F2FF" delay={0.4} />
    </section>
  );
};
