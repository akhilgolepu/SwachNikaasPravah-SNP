/**
 * Animation Configurations for DrainageAI v2.0
 * 
 * These physics-based configurations ensure the "Crazy" fluid feel.
 */

export const transitions = {
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 20
  },
  gentle: {
    type: "spring",
    stiffness: 100,
    damping: 15
  },
  liquid: {
    type: "spring",
    stiffness: 400,
    damping: 10,
    mass: 1
  }
};

export const variants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: transitions.spring
    }
  },
  morph: {
    initial: { borderRadius: "12px" },
    animate: { borderRadius: "48px" },
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

/**
 * Custom Hooks for Animations
 */
export const useGlowAnimation = (intensity: number = 1) => {
  return {
    animate: {
      boxShadow: [
        `0 0 20px 0px rgba(0, 102, 255, ${0.2 * intensity})`,
        `0 0 40px 10px rgba(0, 102, 255, ${0.4 * intensity})`,
        `0 0 20px 0px rgba(0, 102, 255, ${0.2 * intensity})`
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
};
