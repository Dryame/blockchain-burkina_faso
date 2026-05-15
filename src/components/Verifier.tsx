import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { 
  ShieldCheck, 
  Search, 
  XCircle, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Printer, 
  Share2, 
  History,
  Trash2,
  AlertCircle,
  QrCode,
  Network,
  Clock,
  User,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  ArrowRight,
  Eye,
  ChevronLeft
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import Card from './ui/Card';
import Button from './ui/Button';
import { downloadIPFSFile, generateAttestationPDF } from '../utils/download';
import { useAuth } from '../context/AuthContext';
import { MOCK_DIPLOMAS } from '../config/mockData';

const Verifier: React.FC = () => {
  const { user } = useAuth();
  const [diplomaId, setDiplomaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load history from localStorage only for recruiters
    if (user?.role === 'verifier') {
      const savedHistory = localStorage.getItem(`diplo_history_${user.email}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }

    // Auto-verify if ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setDiplomaId(id);
      verifyDiploma(id);
    }
  }, []);

  const verifyDiploma = async (id: string = diplomaId) => {
    if (!id) return;
    setError('');
    setResult(null);
    setLoading(true);
    setStep(1);

    try {
      // Fake delay for animation steps
      await new Promise(r => setTimeout(r, 600));
      setStep(2);
      await new Promise(r => setTimeout(r, 1000));
      setStep(3);
      await new Promise(r => setTimeout(r, 600));

      // Check mock diplomas first
      const mockDiploma = MOCK_DIPLOMAS.find(d => d.id === id);
      if (mockDiploma) {
        const resultData = {
          ...mockDiploma,
          isValid: true,
          institutionAddress: "0xMockInstitution",
          institutionName: "Université Polytechnique de Ouagadougou",
          verifiedAt: new Date().toISOString()
        };
        setResult(resultData);
        if (user?.role === 'verifier') addToHistory(resultData);
        setLoading(false);
        return;
      }

      const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const [diploma, isValid] = await contract.verifyDiploma(id);
      
      if (isValid) {
        const resultData = {
          isValid: true,
          id,
          fullName: diploma.fullName,
          birthDate: diploma.birthDate,
          title: diploma.title,
          mention: diploma.mention,
          year: Number(diploma.year),
          ipfsHash: diploma.ipfsHash,
          institutionAddress: diploma.institutionAddress,
          institutionName: diploma.institutionName,
          timestamp: Number(diploma.timestamp),
          verifiedAt: new Date().toISOString()
        };
        setResult(resultData);
        if (user?.role === 'verifier') addToHistory(resultData);
      } else {
        setResult({ isValid: false, id });
      }
    } catch (err: any) {
      console.error(err);
      setError("Erreur de connexion au registre blockchain. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  const addToHistory = (item: any) => {
    const newHistory = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem(`diplo_history_${user?.email}`, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`diplo_history_${user?.email}`);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem(`diplo_history_${user?.email}`, JSON.stringify(newHistory));
    setItemToDelete(null);
  };

  const shareVerification = () => {
    const url = `${window.location.origin}/verifier?id=${result.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Vérification DiploChain',
        text: `Vérification du diplôme de ${result.fullName}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien de vérification copié !");
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 rounded-3xl bg-ui-card border-2 border-ui-border flex items-center justify-center shadow-xl">
                <ShieldCheck className="text-burkina-green" size={40} />
             </div>
          </div>
          <h2 className="heading-xl text-ui-text mb-4">
            Vérification <span className="text-burkina-green underline decoration-burkina-green/20 underline-offset-8">Instantanée</span>
          </h2>
          <p className="text-ui-muted italic font-medium max-w-2xl mx-auto">
            Plateforme officielle blockchain anti-fraude du Burkina Faso. Authentifiez n'importe quel diplôme en quelques secondes.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-burkina-green to-burkina-red rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex p-2 bg-ui-card rounded-3xl border border-ui-border shadow-2xl">
              <input 
                type="text" 
                placeholder="ID Diplôme (ex: DIPL-2024-001)"
                value={diplomaId}
                onChange={(e) => setDiplomaId(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-6 font-bold text-ui-text placeholder:text-ui-muted/50"
                onKeyPress={(e) => e.key === 'Enter' && verifyDiploma()}
              />
              <Button 
                variant="primary" 
                className="h-14 px-8 rounded-2xl" 
                icon={Search}
                onClick={() => verifyDiploma()}
                disabled={loading}
              >
                {loading ? "Vérification..." : "Vérifier"}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-6">
             <button className="flex items-center gap-2 text-[10px] font-black uppercase text-ui-muted hover:text-ui-text transition-all tracking-widest">
                <QrCode size={14} /> Scanner QR Code
             </button>
             <button className="flex items-center gap-2 text-[10px] font-black uppercase text-ui-muted hover:text-ui-text transition-all tracking-widest">
                <Network size={14} /> Réseau Amoy Actif
             </button>
          </div>
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-10"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-4 border-ui-border rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-4 border-4 border-burkina-green border-t-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <ShieldCheck className="text-burkina-green animate-pulse" size={40} />
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { s: 1, label: "Connexion au réseau blockchain..." },
                  { s: 2, label: "Recherche du diplôme sur Polygon..." },
                  { s: 3, label: "Analyse de l'authenticité digitale..." }
                ].map((l) => (
                  <motion.p 
                    key={l.s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: step >= l.s ? 1 : 0.3,
                      x: step >= l.s ? 0 : -10,
                      color: step === l.s ? '#009E49' : '#94a3b8'
                    }}
                    className="text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    {step > l.s ? <CheckCircle2 size={14} className="text-burkina-green" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    {l.label}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button 
                onClick={() => setResult(null)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-ui-muted hover:text-ui-text transition-all mb-8 bg-ui-card px-4 py-2 rounded-xl border border-ui-border"
              >
                <ChevronLeft size={14} /> Retour à la recherche
              </button>
              
              {result.isValid ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <Card className="lg:col-span-2 p-10 border-burkina-green/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-burkina-green/5 blur-3xl rounded-full -mr-20 -mt-20" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-ui-border">
                      <div className="w-24 h-24 rounded-full bg-burkina-green/10 flex items-center justify-center border-4 border-burkina-green/20">
                         <CheckCircle2 size={48} className="text-burkina-green" />
                      </div>
                      <div className="text-center md:text-left">
                        <span className="px-3 py-1 rounded-full bg-burkina-green text-white text-[10px] font-black uppercase tracking-widest">
                          Diplôme Authentique ✓
                        </span>
                        <h3 className="heading-lg text-ui-text mt-3">{result.fullName}</h3>
                        <p className="text-ui-muted uppercase text-[10px] font-black tracking-[0.2em] italic mt-1">Certification Blockchain Active</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ui-surface flex items-center justify-center text-ui-muted"><GraduationCap size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Grade Académique</p>
                           <p className="font-bold text-ui-text uppercase leading-tight">{result.title}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ui-surface flex items-center justify-center text-ui-muted"><Building2 size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Émetteur</p>
                           <p className="font-bold text-ui-text uppercase leading-tight">{result.institutionName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ui-surface flex items-center justify-center text-ui-muted"><Calendar size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Année & Mention</p>
                           <p className="font-bold text-ui-text uppercase leading-tight">{result.year} — {result.mention}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ui-surface flex items-center justify-center text-ui-muted"><Clock size={20} /></div>
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Date d'émission</p>
                           <p className="font-bold text-ui-text uppercase leading-tight">{new Date(result.timestamp * 1000).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 p-6 rounded-3xl bg-ui-bg border border-ui-border flex flex-col md:flex-row items-center gap-6">
                       <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest mb-1">Blockchain Hash (SHA-256)</p>
                          <p className="text-[10px] font-mono text-ui-text truncate font-bold">{result.ipfsHash}</p>
                       </div>
                       <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://amoy.polygonscan.com/address/${result.institutionAddress}`, '_blank')}
                          >
                            <ExternalLink size={14} />
                          </Button>
                       </div>
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full h-20 shadow-xl shadow-burkina-green/10"
                      icon={Download}
                      onClick={() => downloadIPFSFile(result.ipfsHash, `DiploChain_${result.id}.pdf`)}
                    >
                      DÉLIVRER PDF ORIGINAL
                    </Button>
                    <Card className="p-8">
                       <h4 className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-6">Actions Administratives</h4>
                       <div className="space-y-3">
                          <button 
                            onClick={() => generateAttestationPDF(result)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-ui-surface border border-ui-border hover:border-ui-text transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                <Printer size={18} className="text-ui-muted group-hover:text-ui-text" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Rapport PDF</span>
                             </div>
                             <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                          <button 
                            onClick={shareVerification}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-ui-surface border border-ui-border hover:border-ui-text transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                <Share2 size={18} className="text-ui-muted group-hover:text-ui-text" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Partager Preuve</span>
                             </div>
                             <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                       </div>
                    </Card>
                    
                    <Card className="p-6 bg-gradient-to-br from-burkina-green/5 to-burkina-yellow/5" hoverEffect={false}>
                       <p className="text-[10px] text-ui-muted leading-relaxed font-medium uppercase text-center">
                        Ce diplôme est immuable et reconnu par l'État Burkibabé via le protocole DiploChain.
                       </p>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto p-12 text-center border-2 border-burkina-red bg-burkina-red/5">
                  <XCircle size={80} className="text-burkina-red mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-burkina-red mb-4 uppercase tracking-tight">DIPLÔME NON CERTIFIÉ</h3>
                  <p className="text-ui-muted mb-8 leading-relaxed font-medium">
                    L'identifiant <strong>{result.id}</strong> n'a pu être authentifié sur la blockchain. 
                    Ce matricule est soit falsifié, soit inexistant dans le registre numérique.
                  </p>
                  <Button variant="ghost" onClick={() => setResult(null)}>Réessayer une recherche</Button>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History for recruiters */}
        {user?.role === 'verifier' && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-32 pt-20 border-t border-ui-border pb-20"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <History className="text-ui-muted" />
                  <h3 className="text-lg font-bold text-ui-text uppercase tracking-tight">Historique de Vérification</h3>
               </div>
               <button 
                onClick={clearHistory}
                className="text-[10px] font-black text-burkina-red uppercase tracking-widest hover:underline"
               >
                Effacer tout
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, idx) => (
                <motion.div 
                  key={item.id + idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-3xl bg-ui-card border border-ui-border hover:border-ui-text/30 transition-all cursor-pointer group relative"
                  onClick={() => {
                    setDiplomaId(item.id);
                    setResult(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-ui-muted hover:text-burkina-red hover:bg-burkina-red/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-burkina-green uppercase bg-burkina-green/10 px-2 py-0.5 rounded">Valide</span>
                    <span className="text-[9px] font-bold text-ui-muted uppercase">{new Date(item.verifiedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-ui-text uppercase text-sm mb-1 pr-8">{item.fullName}</h4>
                  <p className="text-[10px] text-ui-muted uppercase font-bold tracking-tight mb-4">{item.title}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-ui-border mt-auto">
                    <span className="text-[9px] font-mono text-ui-muted">{item.id}</span>
                    <Eye size={14} className="text-ui-muted group-hover:text-ui-text" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Global Error */}
        {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto p-8 rounded-3xl bg-burkina-red/10 border border-burkina-red/30 text-center mt-12"
            >
              <AlertCircle className="text-burkina-red mx-auto mb-4" size={32} />
              <p className="text-sm font-bold text-burkina-red uppercase mb-6 leading-relaxed">{error}</p>
              <Button variant="ghost" onClick={() => verifyDiploma()}>Réessayer</Button>
            </motion.div>
          )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {itemToDelete && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ui-bg/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-ui-card border border-ui-border rounded-[32px] p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-burkina-red/10 flex items-center justify-center text-burkina-red mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-ui-text text-center mb-2 uppercase tracking-tight">Supprimer ?</h3>
                <p className="text-ui-muted text-sm text-center mb-8 font-medium">
                  Cette action retirera définitivement ce diplôme de votre historique local de vérification.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="ghost" className="w-full h-12" onClick={() => setItemToDelete(null)}>Annuler</Button>
                  <Button variant="primary" className="w-full h-12 bg-burkina-red hover:bg-burkina-red/90 border-none" onClick={() => removeFromHistory(itemToDelete)}>Supprimer</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Verifier;
