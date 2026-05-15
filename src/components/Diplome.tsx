import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ethers } from 'ethers';
import { 
  Search, 
  Download, 
  Share2, 
  Award, 
  Calendar, 
  User, 
  Building, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Hash,
  Loader2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import Button from './ui/Button';
import Card from './ui/Card';
import LoadingBlockchain from './ui/LoadingBlockchain';

export default function Diplome() {
  const [diplomaId, setDiplomaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const searchDiploma = async (e) => {
    e.preventDefault();
    if (!diplomaId) return;

    setLoading(true);
    setError("");
    setDiploma(null);

    try {
      const provider = new ethers.JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/your-api-key"); // Using public or env RPC
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const result = await contract.getDiploma(diplomaId);
      
      if (result.fullName === "") {
        throw new Error("Diplôme inexistant");
      }

      setDiploma({
        fullName: result.fullName,
        birthDate: result.birthDate,
        title: result.title,
        mention: result.mention,
        year: Number(result.year),
        ipfsHash: result.ipfsHash,
        institutionAddress: result.institutionAddress,
        institutionName: result.institutionName,
        timestamp: Number(result.timestamp)
      });
    } catch (err) {
      console.error(err);
      setError("Désolé, aucun diplôme trouvé pour cet identifiant.");
    } finally {
      setLoading(false);
    }
  };

  const getIPFSUrl = (hash) => `https://gateway.pinata.cloud/ipfs/${hash}`;

  const copyLink = () => {
    const url = `${window.location.origin}/verifier?id=${diplomaId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-32 px-4">
      <div className="mb-16 text-center">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="inline-block p-4 bg-burkina-yellow/10 rounded-3xl mb-4 border border-burkina-yellow/20"
        >
          <Award size={48} className="text-burkina-yellow" />
        </motion.div>
        <h1 className="heading-xl text-ui-text mb-4 tracking-tighter">
          Espace <span className="text-burkina-yellow">Diplômé</span>
        </h1>
        <p className="body-lg max-w-2xl mx-auto italic">
          Accédez à la preuve numérique de votre réussite et téléchargez votre certificat certifié par DiploChain.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-20">
        <form onSubmit={searchDiploma} className="relative group">
           <div className="absolute inset-x-4 -top-8 text-[11px] font-black uppercase tracking-widest text-ui-muted italic">
             Numéro de Certification Blockchain
           </div>
           <div className="flex flex-col sm:flex-row gap-4 p-3 bg-ui-card rounded-[32px] border border-ui-border shadow-2xl focus-within:border-burkina-yellow/50 transition-all overflow-hidden">
             <input 
               type="text" 
               placeholder="Ex: DIPL-2024-001"
               value={diplomaId}
               onChange={(e) => setDiplomaId(e.target.value)}
               className="flex-1 bg-transparent px-6 py-4 text-xl font-heading font-black text-burkina-yellow placeholder:text-ui-muted outline-none uppercase italic"
             />
             <Button type="submit" loading={loading} icon={Search} className="h-16 px-10 rounded-[24px]">
               VOIR MON DIPLÔME
             </Button>
           </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingBlockchain message="Extraction des données chiffrées..." />
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto p-12 glass-card border-burkina-red/30 text-center"
          >
            <AlertCircle size={64} className="text-burkina-red mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-ui-text mb-3 uppercase tracking-tight">Diplôme Introuvable</h3>
            <p className="text-ui-muted mb-8 font-medium">{error}</p>
            <Button variant="ghost" onClick={() => setError("")}>RESAISIR LE MATRICULE</Button>
          </motion.div>
        ) : diploma && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Diploma Card Preview */}
            <div className="lg:col-span-8">
              <Card className="p-0 border-none bg-gradient-to-br from-ui-bg via-ui-surface to-ui-bg" hoverEffect={false}>
                 <div className="relative p-12 min-h-[550px] flex flex-col justify-between overflow-hidden rounded-[32px] border-2 border-ui-border shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burkina-red via-burkina-yellow to-burkina-green" />
                    <div className="absolute -top-20 -right-20 opacity-5 text-ui-text">
                       <Award size={400} />
                    </div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start relative z-10">
                       <div className="bg-ui-text p-4 rounded-2xl shadow-xl">
                          <Building className="text-ui-bg" size={32} />
                       </div>
                       <div className="text-right">
                          <div className="text-[10px] font-black text-burkina-yellow uppercase tracking-widest mb-1 italic">Vérification Automatique</div>
                          <div className="text-[10px] font-mono text-ui-muted break-all max-w-[200px]">{diploma.ipfsHash}</div>
                       </div>
                    </div>

                    {/* Main Content */}
                    <div className="text-center my-12 relative z-10">
                       <h4 className="text-burkina-yellow font-black uppercase tracking-widest text-xs mb-4 italic">REPUBLIQUE DU BURKINA FASO</h4>
                       <p className="text-ui-muted text-[9px] uppercase font-black mb-8 tracking-[0.3em]">CERTIFICAT DE RÉUSSITE NUMÉRIQUE BLOCKCHAIN</p>
                       
                       <h2 className="text-2xl md:text-4xl font-heading font-black text-ui-text mb-6 uppercase italic tracking-tighter">
                           {diploma.fullName}
                       </h2>
                       
                       <div className="flex items-center justify-center gap-4 mb-10">
                          <div className="h-0.5 w-12 bg-burkina-red" />
                          <div className="h-0.5 w-12 bg-burkina-yellow" />
                          <div className="h-0.5 w-12 bg-burkina-green" />
                       </div>
                       
                       <p className="text-lg text-ui-muted max-w-xl mx-auto leading-relaxed font-medium">
                          A validé avec succès le grade académique de <br />
                          <span className="text-ui-text font-heading font-black uppercase italic tracking-tight">{diploma.title}</span>
                       </p>
                    </div>

                    {/* Footer Infos */}
                    <div className="grid grid-cols-3 gap-8 pt-12 border-t border-ui-border relative z-10">
                       <div className="space-y-1">
                          <span className="block text-[8px] font-black text-ui-muted uppercase tracking-widest opacity-60">Mention Exceptionnelle</span>
                          <span className="text-base font-heading font-black text-burkina-green uppercase italic">{diploma.mention}</span>
                       </div>
                       <div className="text-center space-y-1">
                          <span className="block text-[8px] font-black text-ui-muted uppercase tracking-widest opacity-60">Année de Promotion</span>
                          <span className="text-base font-heading font-black text-ui-text italic">{diploma.year}</span>
                       </div>
                       <div className="text-right space-y-1">
                          <span className="block text-[8px] font-black text-ui-muted uppercase tracking-widest opacity-60">Établissement Émetteur</span>
                          <span className="text-xs font-black text-ui-text uppercase leading-none italic">{diploma.institutionName}</span>
                       </div>
                    </div>
                    
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-[140px] font-black text-ui-text/5 -rotate-12 uppercase italic tracking-tighter">CERTIFIÉ</span>
                    </div>
                 </div>
              </Card>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                 <Button 
                   size="lg" 
                   variant="primary" 
                   icon={Download}
                   className="shadow-xl h-16"
                   onClick={() => window.open(getIPFSUrl(diploma.ipfsHash), '_blank')}
                 >
                   PDF ORIGINAL
                 </Button>
                 <Button 
                   size="lg" 
                   variant="secondary" 
                   icon={copied ? CheckCircle2 : Copy}
                   className="h-16"
                   onClick={copyLink}
                 >
                   {copied ? 'LIEN COPIÉ !' : 'COPIER LE LIEN'}
                 </Button>
                 <Button 
                   size="lg" 
                   variant="outline" 
                   icon={ExternalLink}
                   className="h-16"
                   onClick={() => window.open(`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`, '_blank')}
                 >
                   AUDIT RÉSEAU
                 </Button>
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="text-center p-8 bg-ui-card border-ui-border border-2">
                 <h3 className="text-[11px] font-black text-ui-muted uppercase mb-8 tracking-[0.2em] italic">Code de Validation Rapide</h3>
                 <div className="bg-white p-6 inline-block rounded-[40px] shadow-2xl relative mb-8 border-4 border-ui-border">
                    <QRCodeSVG 
                      value={`${window.location.origin}/verifier?id=${diplomaId}`}
                      size={180}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Flag_of_Burkina_Faso.svg/1024px-Flag_of_Burkina_Faso.svg.png",
                        x: undefined,
                        y: undefined,
                        height: 36,
                        width: 36,
                        excavate: true,
                      }}
                    />
                 </div>
                 <p className="text-[11px] text-ui-muted leading-relaxed uppercase font-bold tracking-tight px-6 italic">
                    Présentez ce QR Code pour une vérification instantanée de vos compétences par tout recruteur.
                 </p>
              </Card>

              <Card className="p-8 border-burkina-green/20 bg-burkina-green/5">
                 <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="text-burkina-green" />
                    <h3 className="text-xs font-black text-ui-text uppercase tracking-widest italic">Méta-Source Blockchain</h3>
                 </div>
                 <div className="space-y-6 font-mono text-[10px] uppercase">
                    <div className="flex flex-col gap-1">
                       <span className="text-ui-muted opacity-60">ID Diplôme Unique</span>
                       <span className="text-ui-text font-bold break-all bg-ui-surface p-2 rounded-lg">{diplomaId}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-ui-muted opacity-60">Empreinte IPFS (CID)</span>
                       <span className="text-burkina-yellow font-bold break-all bg-ui-surface p-2 rounded-lg">{diploma.ipfsHash}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-ui-muted opacity-60">Horodatage de Certification</span>
                       <span className="text-ui-text font-bold bg-ui-surface p-2 rounded-lg">{new Date(diploma.timestamp * 1000).toLocaleString()}</span>
                    </div>
                 </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
