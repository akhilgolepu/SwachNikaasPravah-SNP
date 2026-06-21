import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RefinedDashboard Component
 * 
 * This is a visual "Skeleton" and design reference for the Gemini model.
 * It demonstrates the "Crazy" animations, rounded shapes, and hyper-focused gradients.
 */

export const RefinedDashboard = () => {
  return (
    <div className="min-h-screen p-8 space-y-8 font-sans">
      {/* Header with Glassmorphism */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <span className="text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight glow-text">DrainageAI <span className="text-brand-primary">v2.0</span></h1>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          {['Dashboard', 'Map View', 'Inventory', 'Dispatch'].map((item) => (
            <button key={item} className="hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-status-ok/10 border border-status-ok/20">
            <div className="w-2 h-2 rounded-full bg-status-ok animate-pulse" />
            <span className="text-xs font-mono text-status-ok uppercase">Live System</span>
          </div>
        </div>
      </motion.header>

      {/* Bento Grid KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard label="Monitored Drains" value="12" sub="2 Cities" color="brand-primary" delay={0.1} />
        <KPICard label="Critical Alerts" value="04" sub="Immediate Action" color="status-critical" delay={0.2} isFocus />
        <KPICard label="Warnings" value="04" sub="Monitor Closely" color="status-warning" delay={0.3} />
        <KPICard label="Crews Live" value="08" sub="On Mission" color="brand-cyan" delay={0.4} />
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8 h-[600px]">
        {/* Animated Alert Feed */}
        <motion.aside 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-12 lg:col-span-4 glass-card overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-bold uppercase tracking-widest text-xs text-white/40">Active Alert Feed</h2>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-xs">↓</span>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <AlertItem name="Worli Sea Face Box" risk={98} status="critical" />
            <AlertItem name="Madhapur Underpass" risk={84} status="critical" />
            <AlertItem name="BKC Connector Drain" risk={72} status="warning" />
          </div>
        </motion.aside>

        {/* Hyper-Focused Map Container */}
        <motion.main 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="col-span-12 lg:col-span-8 glass-card relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png')] opacity-20 grayscale" />
          
          {/* Focused Element Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-brand-primary/5 blur-[100px] animate-pulse" />
          </div>

          <div className="relative z-10 p-8 h-full flex flex-col justify-end">
            <div className="glass-card p-6 w-fit animate-float">
              <p className="text-xs font-mono text-brand-cyan mb-2">FOCUSED ASSET</p>
              <h3 className="text-xl font-bold mb-1">MUM-WOR-018</h3>
              <p className="text-sm text-white/60">Worli, Mumbai · Blockage 84%</p>
            </div>
          </div>
          
          {/* Gradient Border Animation */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:focused-gradient-border pointer-events-none transition-all duration-700" />
        </motion.main>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, sub, color, delay, isFocus = false }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className={`glass-card p-8 relative overflow-hidden ${isFocus ? 'ring-2 ring-status-critical/30' : ''}`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 bg-${color}`} />
    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">{label}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-5xl font-bold tracking-tighter text-${color}`}>{value}</h3>
      <span className="text-xs font-mono opacity-40">UNIT</span>
    </div>
    <p className="text-xs text-white/40 mt-4 flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
      {sub}
    </p>
  </motion.div>
);

const AlertItem = ({ name, risk, status }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${status === 'critical' ? 'bg-status-critical animate-pulse' : 'bg-status-warning'}`} />
          <span className="text-[10px] font-mono uppercase opacity-60">{status}</span>
        </div>
        <h4 className="text-sm font-semibold group-hover:text-brand-primary transition-colors">{name}</h4>
      </div>
      <div className="text-right">
        <span className={`text-lg font-bold font-mono ${status === 'critical' ? 'text-status-critical' : 'text-status-warning'}`}>{risk}</span>
        <p className="text-[8px] font-mono opacity-40">RISK</p>
      </div>
    </div>
  </motion.div>
);
