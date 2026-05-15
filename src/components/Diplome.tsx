import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Download, Share2, FileText, Calendar, User, School, Award, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getContractReadOnly } from '../utils/blockchain';
import { getIPFSUrl } from '../utils/ipfs';

export default function Diplome() {
  const [diplomaId, setDiplomaId] = useState("");
  const [diploma, setDiploma] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchDiploma = async (e) => {
    e.preventDefault();
    if (!diplomaId) return;
    
    setLoading(true);
    setError("");
    setDiploma(null);

    try {
      const contract = getContractReadOnly();
      const [data, exists] = await contract.verifyDiploma(diplomaId);
      
      if (!exists) {
        setError("Aucun diplôme trouvé avec ce numéro unique.");
      } else {
        setDiploma(data);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  const shareLink = () => {
    const url = `${window.location.origin}/verifier?id=${diplomaId}`;
    navigator.clipboard.writeText(url);
    alert("Lien de vérification copié dans le presse-papier !");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">Espace Diplômé</h1>
        <p className="text-lg text-gray-400">Accédez à votre diplôme certifié et partagez votre réussite.</p>
      </div>

      <div className="bg-[#121212] p-2 rounded-2xl shadow-2xl border border-white/5 mb-10">
        <form onSubmit={searchDiploma} className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="Entrez votre numéro de diplôme (ex: DIPL-2024-XXX)"
            value={diplomaId}
            onChange={(e) => setDiplomaId(e.target.value)}
            className="flex-1 p-4 rounded-xl outline-none text-lg font-medium bg-transparent text-white placeholder:font-normal"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-[#009A00] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#007A00] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            Chercher
          </button>
        </form>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-950/20 border border-red-900/30 text-red-500 p-6 rounded-2xl flex items-center gap-4"
        >
          <AlertCircle size={32} className="shrink-0" />
          <p className="text-lg font-semibold">{error}</p>
        </motion.div>
      )}

      {diploma && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border-t-8 border-[#EF2B2D] shadow-2xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
                <School size={300} />
              </div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <Award size={48} className="text-[#FCD116]" />
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">République du Burkina Faso</p>
                  <p className="text-sm font-medium text-gray-500 italic">Unité - Progrès - Justice</p>
                </div>
              </div>

              <div className="text-center space-y-4 mb-10 relative z-10">
                <p className="text-lg font-bold text-[#009A00] uppercase tracking-wider leading-tight">{diploma.institutionName}</p>
                <h2 className="text-4xl font-serif font-black text-gray-800 break-words">DIPLÔME DE {diploma.title.toUpperCase()}</h2>
                <div className="h-1 w-24 bg-[#FCD116] mx-auto"></div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4 text-gray-700">
                  <User className="text-gray-400 shrink-0" />
                  <span className="text-lg">Décerné à : <strong>{diploma.fullName}</strong></span>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <Calendar className="text-gray-400 shrink-0" />
                  <span>Né(e) le : <strong>{diploma.birthDate}</strong></span>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <Award className="text-gray-400 shrink-0" />
                  <span>Avec la mention : <strong className="text-[#009A00]">{diploma.mention}</strong></span>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row justify-between items-end border-t pt-6 gap-4 relative z-10">
                <div className="text-[10px] text-gray-400 font-mono w-full sm:max-w-xs break-all">
                  <p className="font-bold uppercase mb-1">Hash Blockchain :</p>
                  <p>{diploma.ipfsHash}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">Date d'émission</p>
                  <p className="font-bold">{new Date(Number(diploma.timestamp) * 1000).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={getIPFSUrl(diploma.ipfsHash)} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white text-black p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl"
              >
                <Download size={20} /> Télécharger le PDF
              </a>
              <button 
                onClick={shareLink}
                className="flex-1 bg-transparent border-2 border-white/20 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <Share2 size={20} /> Partager le lien
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#121212] rounded-3xl p-8 border border-white/5 shadow-2xl text-center">
              <h3 className="font-bold text-gray-300 mb-4 flex items-center justify-center gap-2 uppercase text-sm tracking-tight">
                <FileText size={20} className="text-[#009A00]" /> QR CODE DE VÉRIFICATION
              </h3>
              <div className="bg-white p-4 inline-block border-4 border-[#FCD116] rounded-2xl mb-4 shadow-xl">
                <QRCodeSVG 
                  value={`${window.location.origin}/verifier?id=${diplomaId}`}
                  size={160}
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed uppercase font-bold tracking-tighter">Authenticité Garantie par DiploChain</p>
            </div>

            <div className="bg-gradient-to-br from-[#009A00] to-[#004d00] rounded-3xl p-8 text-white shadow-2xl border border-white/10">
              <h3 className="font-bold mb-2 flex items-center gap-2 uppercase text-sm"><ShieldCheckIcon /> Sécurité Blockchain</h3>
              <p className="text-xs opacity-90 mb-4 leading-relaxed">Ce diplôme est ancré sur la blockchain Polygon. Toute modification des données rendrait la vérification invalide.</p>
              <a 
                href={`https://amoy.polygonscan.com/address/${diploma.institutionAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md hover:bg-white/20 transition-all border border-white/5"
              >
                Vérifier l'émetteur <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ShieldCheckIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
