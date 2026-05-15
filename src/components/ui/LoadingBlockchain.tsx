import React from 'react';
import { motion } from 'motion/react';
import { Box, ShieldCheck, Database, Server } from 'lucide-react';

export default function LoadingBlockchain({ message = "Vérification Blockchain..." }) {
  const nodes = [
    { icon: <Database />, label: "IPFS" },
    { icon: <Box />, label: "Block" },
    { icon: <ShieldCheck />, label: "Nodes" },
    { icon: <Server />, label: "RPC" }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-32 h-32 mb-8">
        {/* Central Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-burkina-green/20 rounded-full blur-2xl"
        />
        
        {/* Orbital Nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, delay: i * 0.5 }
            }}
            style={{ 
              transformOrigin: '64px 64px',
              position: 'absolute',
              top: 0, 
              left: '50%',
              marginLeft: '-16px'
            }}
            className="p-2 bg-dark-card border border-white/10 rounded-xl text-burkina-green shadow-lg"
          >
            <div style={{ transform: `rotate(-${i * 90}deg)` }}>
              {React.cloneElement(node.icon, { size: 16 })}
            </div>
          </motion.div>
        ))}

        {/* Central hex icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-burkina-yellow"
          >
            <ShieldCheck size={40} />
          </motion.div>
        </div>
      </div>

      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-lg font-black text-text-primary uppercase tracking-[0.2em] text-center"
      >
        {message}
      </motion.p>
      
      <div className="mt-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 bg-burkina-green rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
