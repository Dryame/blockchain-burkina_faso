import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, User, Search, School, Home as HomeIcon, Wallet, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import Admin from './components/Admin';
import Diplome from './components/Diplome';
import Verifier from './components/Verifier';

function Navbar() {
  const location = useLocation();
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    checkAccount();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
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
  
  const navItems = [
    { path: '/', label: 'Accueil', icon: <HomeIcon size={18} /> },
    { path: '/verifier', label: 'Vérifier', icon: <Search size={18} /> },
    { path: '/diplome', label: 'Diplômes', icon: <User size={18} /> },
    { path: '/admin', label: 'Etablissement', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <nav className="bg-[#050505] border-b border-white/5 sticky top-0 z-50 shadow-xl backdrop-blur-xl bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-[#009A00] p-1.5 rounded-lg group-hover:bg-[#EF2B2D] transition-colors">
            <School className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic hidden sm:inline">
            Diplo<span className="text-[#EF2B2D]">Chain</span>
          </span>
        </Link>
        
        <div className="flex gap-1 md:gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-[#FCD116]/10 text-[#FCD116]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {account ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <Wallet size={16} className="text-[#FCD116]" />
              <span className="text-[10px] font-mono font-bold text-gray-300">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="flex items-center gap-2 bg-[#EF2B2D] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#D12224] transition-all shadow-md shadow-red-200 active:scale-95"
            >
              <LogIn size={16} />
              <span className="hidden md:inline">Connexion</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="max-w-5xl mx-auto py-20 px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-block p-4 bg-[#FCD116]/20 rounded-full mb-6"
      >
        <ShieldCheck size={48} className="text-[#009A00]" />
      </motion.div>
      <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
        L'excellence du <span className="text-[#009A00]">Burkina</span> <br /> 
        certifiée sur <span className="text-[#EF2B2D]">Blockchain</span>
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
        DiploChain assure l'authenticité des diplômes universitaires burkinabè pour restaurer la confiance entre diplômés et recruteurs.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/verifier" className="bg-[#EF2B2D] text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all">
          VÉRIFIER UN DIPLÔME
        </Link>
        <Link to="/diplome" className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
          MON ESPACE DIPLÔMÉ
        </Link>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-8 bg-[#121212] rounded-3xl shadow-lg border border-white/5 hover:border-[#009A00] transition-colors cursor-default">
          <div className="h-12 w-12 bg-[#009A00] text-white rounded-xl flex items-center justify-center mb-6 font-bold text-xl shadow-lg shadow-[#009A00]/20">1</div>
          <h3 className="font-black text-xl text-white mb-3 uppercase tracking-tighter">Immuabilité</h3>
          <p className="text-gray-400 leading-relaxed">Le diplôme est gravé dans la blockchain. Toute tentative de modification est instantanément détectée.</p>
        </div>
        <div className="p-8 bg-[#121212] rounded-3xl shadow-lg border border-white/5 hover:border-[#EF2B2D] transition-colors cursor-default">
          <div className="h-12 w-12 bg-[#EF2B2D] text-white rounded-xl flex items-center justify-center mb-6 font-bold text-xl shadow-lg shadow-[#EF2B2D]/20">2</div>
          <h3 className="font-black text-xl text-white mb-3 uppercase tracking-tighter">Instantaneité</h3>
          <p className="text-gray-400 leading-relaxed">Verification en moins de 3 secondes via numéro unique ou QR Code pour les recruteurs.</p>
        </div>
        <div className="p-8 bg-[#121212] rounded-3xl shadow-lg border border-white/5 hover:border-[#FCD116] transition-colors cursor-default">
          <div className="h-12 w-12 bg-[#FCD116] text-[#009A00] rounded-xl flex items-center justify-center mb-6 font-bold text-xl shadow-lg shadow-[#FCD116]/20">3</div>
          <h3 className="font-black text-xl text-white mb-3 uppercase tracking-tighter">Confiance</h3>
          <p className="text-gray-400 leading-relaxed">Seuls les établissements accrédités par le Ministère peuvent émettre des certificats sur DiploChain.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] flex flex-col font-sans selection:bg-[#FCD116] selection:text-[#009A00]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/diplome" element={<Diplome />} />
            <Route path="/verifier" element={<Verifier />} />
          </Routes>
        </main>
        <footer className="bg-[#050505] border-t border-white/5 py-12 px-4 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">
                Diplo<span className="text-[#EF2B2D]">Chain</span>
              </span>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Plateforme Nationale de Certification Blockchain</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              <span>Technologie Polygon</span>
              <span>IPFS Storage</span>
              <span>Web3 Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
