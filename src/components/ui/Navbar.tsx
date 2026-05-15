import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  School, 
  Search, 
  User, 
  ShieldCheck, 
  Wallet, 
  LogIn, 
  Copy, 
  CheckCircle2, 
  Menu, 
  X,
  LogOut,
  ChevronDown,
  Building2,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

export default function Navbar({ account, connectWallet }: { account: string | null, connectWallet: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const RoleIcon = () => {
    if (user?.role === 'institution') return <Building2 size={14} />;
    if (user?.role === 'graduate') return <GraduationCap size={14} />;
    return <Briefcase size={14} />;
  };

  const navItems = [
    { path: '/', label: 'Accueil', icon: <School size={18} /> },
    { path: '/verifier', label: 'Vérifier', icon: <Search size={18} /> },
    ...(isAuthenticated && user?.role === 'graduate' ? [{ path: '/espace-diplome', label: 'Diplômes', icon: <User size={18} /> }] : []),
    ...(isAuthenticated && user?.role === 'institution' ? [{ path: '/admin', label: 'Gestion', icon: <ShieldCheck size={18} /> }] : []),
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-2 px-4' : 'py-6 px-4'
      }`}>
        <div className={`max-w-7xl mx-auto dark:bg-ui-card/80 bg-white/80 backdrop-blur-xl transition-all duration-500 border border-ui-border ${
          scrolled ? 'rounded-2xl py-2' : 'rounded-[32px] py-3'
        } px-6 flex items-center justify-between shadow-xl`}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="bg-burkina-green p-2 rounded-xl shadow-lg shadow-burkina-green/20"
            >
              <School className="text-white" size={24} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-ui-text tracking-tighter uppercase italic leading-none">
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
                className={`relative px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
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

          {/* Contextual Auth / User Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-2 bg-ui-surface px-3 py-1.5 rounded-full border border-ui-border">
              <div className="w-2 h-2 rounded-full bg-burkina-green animate-pulse shadow-[0_0_8px_rgba(0,154,0,0.5)]" />
              <span className="text-[9px] font-bold text-ui-muted uppercase tracking-widest">Polygon Amoy</span>
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 bg-ui-surface border border-ui-border hover:border-ui-text/30 p-1.5 pr-4 rounded-full transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-ui-bg flex items-center justify-center text-ui-text border border-ui-border overflow-hidden">
                     <User size={20} />
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-[9px] font-black text-ui-muted uppercase tracking-widest flex items-center gap-1">
                      <RoleIcon /> {user?.role}
                    </span>
                    <span className="text-[11px] font-bold text-ui-text max-w-[120px] truncate">{user?.name}</span>
                  </div>
                  <ChevronDown size={14} className={`text-ui-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-ui-card border border-ui-border rounded-3xl shadow-2xl overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-ui-border mb-2">
                        <p className="text-[9px] font-black text-ui-muted uppercase">Session active</p>
                        <p className="text-[11px] font-bold text-ui-text truncate">{user?.email}</p>
                      </div>
                      
                      {user?.walletAddress && (
                        <button 
                          onClick={copyAddress}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-ui-surface text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet size={16} className="text-burkina-green" />
                            <span className="text-[11px] font-bold uppercase tracking-tight text-ui-text">Wallet</span>
                          </div>
                          <span className="text-[9px] font-mono font-black text-ui-muted">
                            {user.walletAddress.substring(0, 4)}...{user.walletAddress.substring(38)}
                          </span>
                        </button>
                      )}

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-burkina-red/5 text-burkina-red transition-colors"
                      >
                        <LogOut size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-tight">Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/register" className="hidden md:block">
                  <Button variant="ghost" className="h-11 px-6 text-[10px] uppercase font-black tracking-widest border-ui-border">S'inscrire</Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" className="h-11 px-6 text-[10px] uppercase font-black tracking-widest bg-burkina-red" icon={LogIn}>Login</Button>
                </Link>
              </div>
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
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full h-16 mt-4">Se connecter</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
