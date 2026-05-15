import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/ui/Navbar';
import ParticleBackground from './components/ui/ParticleBackground';
import Home from './pages/Home';
import Admin from './components/Admin';
import Diplome from './components/Diplome';
import Verifier from './components/Verifier';

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    checkAccount();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });
    }
  }, []);

  const checkAccount = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Veuillez installer MetaMask !");
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-ui-bg text-ui-text font-sans selection:bg-burkina-yellow selection:text-ui-bg relative transition-colors duration-500">
        <ParticleBackground />
        
        <Navbar account={account} connectWallet={connectWallet} />
        
        <main className="relative z-10">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/diplome" element={<Diplome />} />
              <Route path="/verifier" element={<Verifier />} />
            </Routes>
          </PageTransition>
        </main>

        <footer className="relative z-10 pt-24 pb-16 px-4 border-t border-ui-border mt-20 bg-ui-card/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start group cursor-default">
              <span className="text-2xl font-heading font-black text-ui-text tracking-tighter uppercase italic transition-all group-hover:tracking-normal">
                Diplo<span className="text-burkina-red">Chain</span>
              </span>
              <p className="text-[10px] text-ui-muted mt-2 uppercase tracking-[0.5em] font-black italic">
                Plateforme Nationale de Certification Blockchain
              </p>
              <div className="h-1 w-12 bg-burkina-yellow mt-4 rounded-full transition-all group-hover:w-24" />
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black text-ui-muted uppercase tracking-[0.2em]">
              <span className="hover:text-burkina-green transition-all cursor-default hover:scale-110">Polygon Amoy</span>
              <span className="hover:text-burkina-red transition-all cursor-default hover:scale-110">IPFS Storage</span>
              <span className="hover:text-burkina-yellow transition-all cursor-default hover:scale-110">Burkina Faso</span>
              <a 
                href="/DOCUMENTATION_TECHNIQUE.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ui-text hover:text-burkina-yellow border-b-2 border-burkina-yellow/20 hover:border-burkina-yellow pb-1 transition-all italic"
              >
                Documentation Technique
              </a>
            </div>

            <div className="text-center md:text-right flex flex-col gap-2">
               <p className="text-[11px] text-ui-text uppercase font-black tracking-widest">© 2024 DiploChain Protocol</p>
               <p className="text-[10px] text-ui-muted uppercase font-bold tracking-tight">Ministère de l'Enseignement Supérieur</p>
               <div className="flex justify-center md:justify-end gap-2 mt-2">
                  <div className="w-4 h-1 bg-burkina-red rounded-full" />
                  <div className="w-4 h-1 bg-burkina-yellow rounded-full" />
                  <div className="w-4 h-1 bg-burkina-green rounded-full" />
               </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
