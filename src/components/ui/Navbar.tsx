import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { School, Search, User, ShieldCheck, Wallet, LogIn, Copy, CheckCircle2, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ account, connectWallet }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { path: '/', label: 'Accueil', icon: <School size={18} /> },
    { path: '/verifier', label: 'Vérifier', icon: <Search size={18} /> },
    { path: '/diplome', label: 'Diplômes', icon: <User size={18} /> },
    { path: '/admin', label: 'Etablissement', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-2 px-4' : 'py-6 px-4'
      }`}>
        <div className={`max-w-7xl mx-auto glass-card transition-all duration-500 ${
          scrolled ? 'rounded-2xl bg-ui-card/80 py-2' : 'rounded-[32px] py-3'
        } px-6 flex items-center justify-between`}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="bg-burkina-green p-2 rounded-xl shadow-lg shadow-burkina-green/20"
            >
              <School className="text-white" size={24} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black text-ui-text tracking-tighter uppercase italic leading-none">
                Diplo<span className="text-burkina-red">Chain</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] font-black text-burkina-yellow/80">Burkina Faso</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                  location.pathname === item.path 
                  ? 'text-burkina-green' 
                  : 'text-ui-muted hover:text-ui-text hover:bg-ui-surface'
                }`}
              >
                {item.icon}
                {item.label}
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-burkina-green/5 rounded-xl -z-10 border border-burkina-green/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Wallet / Auth */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-2 bg-ui-surface px-3 py-1.5 rounded-full border border-ui-border">
              <div className="w-2 h-2 rounded-full bg-burkina-green animate-pulse shadow-[0_0_8px_rgba(0,154,0,0.5)]" />
              <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest">Polygon Amoy</span>
            </div>

            {account ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyAddress}
                className="flex items-center gap-3 bg-ui-surface border border-burkina-green/30 px-4 py-2 rounded-xl group transition-all hover:border-burkina-green/60"
              >
                <div className="bg-burkina-green/10 p-1.5 rounded-lg">
                  <Wallet size={16} className="text-burkina-green" />
                </div>
                <div className="flex flex-col items-start pr-2">
                  <span className="text-[10px] font-bold text-ui-muted uppercase">Connecté</span>
                  <span className="text-[11px] font-mono font-bold text-ui-text">
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </span>
                </div>
                {copied ? <CheckCircle2 size={16} className="text-burkina-green" /> : <Copy size={14} className="text-ui-muted group-hover:text-ui-text" />}
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                className="flex items-center gap-2 bg-gradient-to-r from-burkina-green to-[#007A00] text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-burkina-green/20"
              >
                <LogIn size={18} />
                <span className="hidden md:inline">Connexion</span>
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-ui-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Burkina Tri-color Indicator */}
        <div className="max-w-7xl mx-auto h-[2px] mt-2 flex px-10">
          <div className="flex-1 bg-burkina-red rounded-l-full" />
          <div className="flex-1 bg-burkina-yellow" />
          <div className="flex-1 bg-burkina-green rounded-r-full" />
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-ui-bg/95 backdrop-blur-2xl pt-32 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-lg font-black uppercase tracking-tight italic border ${
                    location.pathname === item.path 
                    ? 'bg-burkina-green/10 border-burkina-green/30 text-burkina-green' 
                    : 'bg-ui-card border-ui-border text-ui-muted'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${location.pathname === item.path ? 'bg-burkina-green text-white' : 'bg-ui-surface'}`}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
