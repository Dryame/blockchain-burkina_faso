import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  QrCode,
  FileText,
  User,
  Building,
  Calendar,
  Award
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import Button from './ui/Button';
import Card from './ui/Card';
import LoadingBlockchain from './ui/LoadingBlockchain';

export default function Verifier() {
  const [searchParams] = useSearchParams();
  const [diplomaId, setDiplomaId] = useState(searchParams.get('id') || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (searchParams.get('id')) {
      verify(searchParams.get('id'));
    }
  }, [searchParams]);

  const verify = async (id = diplomaId) => {
    if (!id) return;
    setLoading(true);
    setResult(null);

    try {
      const provider = new ethers.JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/your-api-key");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const result = await contract.getDiploma(id);
      
      if (result.fullName !== "") {
        setResult({
          isValid: true,
          data: {
            fullName: result.fullName,
            birthDate: result.birthDate,
            title: result.title,
            mention: result.mention,
            year: Number(result.year),
            ipfsHash: result.ipfsHash,
            institutionAddress: result.institutionAddress,
            institutionName: result.institutionName
          }
        });
        
        // Success celebration
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#009A00', '#EF2B2D', '#FCD116']
        });
      } else {
        setResult({ isValid: false });
      }
    } catch (err) {
      console.error(err);
      setResult({ isValid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-32 px-4">
      <div className="text-center mb-16">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center gap-4 mb-6">
             <div className="bg-burkina-green/10 p-3 rounded-2xl animate-float">
                <ShieldCheck className="text-burkina-green" size={32} />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-ui-text mb-4 uppercase tracking-tight">
            Vérification <span className="text-burkina-green underline decoration-burkina-green/20 underline-offset-8">Instantanée</span>
          </h2>
          <p className="body-lg italic">Plateforme officielle blockchain anti-fraude du Burkina Faso</p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto mb-20">
         <Card className="p-3 bg-ui-card rounded-[32px] border-ui-border" hoverEffect={false}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ui-muted" size={20} />
                 <input 
                   type="text" 
                   placeholder="Scannez ou entrez l'ID Diplôme..."
                   value={diplomaId}
                   onChange={(e) => setDiplomaId(e.target.value)}
                   className="w-full bg-transparent pl-14 pr-6 py-4 text-xl font-black text-ui-text placeholder:text-ui-muted outline-none uppercase font-mono"
                 />
              </div>
              <Button onClick={() => verify()} loading={loading} icon={QrCode} className="h-16 px-10 rounded-[24px]">
                 VÉRIFIER
              </Button>
            </div>
         </Card>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <LoadingBlockchain message="Interrogation du Grand Livre Polygon..." />
          </motion.div>
        ) : result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="overflow-hidden"
          >
            {result.isValid ? (
              <div className="glass-card border-2 border-burkina-green shadow-[0_0_50px_rgba(0,154,0,0.2)] overflow-hidden">
                {/* Header Banner */}
                <div className="bg-burkina-green p-8 md:p-12 text-white flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-6">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="bg-white p-4 rounded-full text-burkina-green shadow-xl"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight">Diplôme Authentique</h3>
                      <p className="opacity-90 font-bold uppercase tracking-widest text-xs mt-1">Certification Blockchain Active ✓</p>
                    </div>
                  </div>
                  <ShieldCheck size={120} className="absolute right-0 top-0 text-white/10 -rotate-12 translate-x-4 -translate-y-4" />
                </div>

                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="flex items-start gap-4">
                        <User className="text-burkina-green mt-1" />
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Titulaire du Diplôme</p>
                           <p className="text-xl font-bold text-ui-text uppercase">{result.data.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Building className="text-burkina-red mt-1" />
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Établissement Émetteur</p>
                           <p className="text-lg font-bold text-ui-text uppercase leading-tight">{result.data.institutionName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Award className="text-burkina-yellow mt-1" />
                        <div>
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-1">Grade Académique</p>
                           <p className="text-base font-bold text-ui-text uppercase">{result.data.title}</p>
                        </div>
                      </div>
                   </div>

                   <div className="bg-ui-surface p-8 rounded-3xl border border-ui-border space-y-6">
                      <div className="flex justify-between items-center border-b border-ui-border pb-4">
                         <span className="text-[10px] font-black text-ui-muted uppercase tracking-widest">MÉTA-DONNÉES</span>
                         <span className="bg-burkina-yellow text-ui-bg px-3 py-1 rounded-full text-[10px] font-black uppercase">Année {result.data.year}</span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-ui-muted uppercase mb-1">Mention Obtenue</span>
                            <span className="text-lg font-black text-burkina-green italic uppercase">{result.data.mention}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-ui-muted uppercase mb-1 tracking-widest">Identifiant Unique (UID)</span>
                            <span className="text-[10px] font-mono text-ui-text break-all">{diplomaId}</span>
                         </div>
                      </div>

                      <div className="pt-6">
                         <a 
                           href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`}
                           target="_blank"
                           className="flex items-center justify-center gap-2 w-full py-4 bg-ui-bg rounded-2xl border border-ui-border text-burkina-green text-[10px] font-black uppercase tracking-widest hover:bg-ui-surface transition-all"
                         >
                           Explorer la transaction <ExternalLink size={12} />
                         </a>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-burkina-green/5 border-t border-burkina-green/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-burkina-green/10 rounded-xl">
                         <FileText size={24} className="text-burkina-green" />
                      </div>
                      <p className="text-xs text-ui-muted leading-relaxed font-medium">Source IPFS Archive : <br /><span className="text-ui-text font-mono italic">{result.data.ipfsHash.substring(0, 32)}...</span></p>
                   </div>
                   <Button size="sm" variant="outline" icon={ExternalLink} onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${result.data.ipfsHash}`, '_blank')}>
                      VOIR LE PDF SOURCE
                   </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card border-2 border-burkina-red p-12 text-center animate-shake relative overflow-hidden">
                <div className="absolute inset-0 bg-burkina-red/5 animate-pulse" />
                <XCircle size={80} className="text-burkina-red mx-auto mb-6 relative z-10" />
                <h3 className="text-2xl font-bold text-burkina-red mb-4 uppercase tracking-tight">DIPLÔME NON CERTIFIÉ</h3>
                <p className="text-lg text-ui-muted max-w-xl mx-auto mb-8 relative z-10 leading-relaxed font-medium">
                  L'identifiant <strong>{diplomaId}</strong> n'a pu être authentifié sur la blockchain DiploChain. <br />
                  <span className="text-burkina-red/80 font-bold uppercase tracking-tight">Ce matricule est soit falsifié, soit non encore migré vers le registre numérique.</span>
                </p>
                <div className="inline-flex items-center gap-3 p-4 bg-burkina-red/10 rounded-2xl border border-burkina-red/20 text-burkina-red text-sm font-black uppercase italic relative z-10">
                   <AlertTriangle size={20} />
                   ATTENTION : L'USAGE DE FAUX DIPLÔMES EST CRIMINEL
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
