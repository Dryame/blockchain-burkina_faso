import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { 
  Award, 
  Download, 
  Share2, 
  QrCode, 
  Search, 
  Filter, 
  ExternalLink, 
  Eye, 
  LayoutGrid, 
  List as ListIcon,
  Star,
  Printer,
  ChevronRight,
  Loader2,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { downloadIPFSFile, generateAttestationPDF, downloadQRCode } from '../utils/download';

const Diplome: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'yearDesc' | 'yearAsc' | 'title'>('yearDesc');
  const [filterType, setFilterType] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedDiploma, setSelectedDiploma] = useState<any>(null);

  useEffect(() => {
    fetchDiplomas();
    const savedFavs = localStorage.getItem(`diplo_favs_${user?.email}`);
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const fetchDiplomas = async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Since we don't have a direct "getDiplomasByEmail", we check the one linked to their account (studentId)
      // and maybe others if we implement a broader search.
      // For this prototype, we'll fetch at least the one they registered with.
      const [result, isValid] = await contract.verifyDiploma(user?.studentId || "");
      
      if (isValid) {
        setDiplomas([{
          id: user?.studentId,
          fullName: result.fullName,
          birthDate: result.birthDate,
          title: result.title,
          mention: result.mention,
          year: Number(result.year),
          ipfsHash: result.ipfsHash,
          institutionAddress: result.institutionAddress,
          institutionName: result.institutionName,
          timestamp: Number(result.timestamp)
        }]);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem(`diplo_favs_${user?.email}`, JSON.stringify(newFavs));
  };

  const sortedAndFiltered = useMemo(() => {
    let result = diplomas.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.institutionName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType !== 'All') {
      result = result.filter(d => d.title.includes(filterType));
    }

    result.sort((a, b) => {
      // Favorites first
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      if (sortBy === 'yearDesc') return b.year - a.year;
      if (sortBy === 'yearAsc') return a.year - b.year;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [diplomas, searchQuery, sortBy, filterType, favorites]);

  if (loading) {
    return (
      <div className="min-h-screen py-40 flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-burkina-red mb-4" size={40} />
         <p className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Initialisation de votre coffre-fort numérique...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-burkina-red/10 flex items-center justify-center text-burkina-red border border-burkina-red/20 shadow-lg shadow-burkina-red/5">
                  <Award size={24} />
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-ui-text tracking-tighter">Mon Espace <span className="text-burkina-red underline decoration-burkina-red/20 underline-offset-4">Diplômé</span></h1>
                  <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest italic mt-1">Registre Blockchain Officiel ✓</p>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 bg-ui-card border border-ui-border rounded-2xl">
             <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-ui-text text-ui-bg' : 'text-ui-muted hover:text-ui-text'}`}
             >
                <LayoutGrid size={20} />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-ui-text text-ui-bg' : 'text-ui-muted hover:text-ui-text'}`}
             >
                <ListIcon size={20} />
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un diplôme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>
          <div className="relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={16} />
             <select 
               className="input-field w-full pl-12 font-bold h-full"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
             >
               <option value="yearDesc">Année (Récent)</option>
               <option value="yearAsc">Année (Ancien)</option>
               <option value="title">Alphabétique</option>
             </select>
          </div>
          <div className="relative">
             <select 
               className="input-field w-full font-bold h-full"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="All">Tous les niveaux</option>
               <option value="Licence">Licence</option>
               <option value="Master">Master</option>
               <option value="Doctorat">Doctorat</option>
               <option value="Bac">Baccalauréat</option>
             </select>
          </div>
        </div>

        {/* Empty State */}
        {sortedAndFiltered.length === 0 ? (
          <Card className="py-24 text-center">
             <Award size={64} className="text-ui-muted/30 mx-auto mb-6" />
             <h3 className="text-xl font-bold text-ui-text uppercase mb-2">Coffre-fort vide</h3>
             <p className="text-ui-muted max-w-sm mx-auto font-medium italic">
               Si vous avez déjà obtenu votre diplôme, contactez votre établissement pour l'émettre sur la blockchain DiploChain.
             </p>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
            {sortedAndFiltered.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                {viewMode === 'grid' ? (
                  <Card className="h-full flex flex-col p-8 group relative overflow-hidden" onClick={() => setSelectedDiploma(d)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-burkina-red/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-6">
                       <span className="px-3 py-1 rounded-full bg-burkina-green/10 text-burkina-green text-[9px] font-black uppercase tracking-widest">
                          On-Chain ✓
                       </span>
                       <button 
                        onClick={(e) => toggleFavorite(d.id, e)}
                        className={`transition-colors ${favorites.includes(d.id) ? 'text-burkina-yellow' : 'text-ui-muted hover:text-ui-text'}`}
                       >
                          <Star size={20} fill={favorites.includes(d.id) ? 'currentColor' : 'none'} />
                       </button>
                    </div>

                    <h3 className="text-lg font-bold text-ui-text uppercase leading-tight mb-2 flex-1">{d.title}</h3>
                    <p className="text-[11px] font-bold text-ui-muted uppercase tracking-tight mb-6 italic">{d.institutionName}</p>

                    <div className="space-y-4 pt-6 border-t border-ui-border mt-auto">
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-ui-muted">
                          <span>Promotion</span>
                          <span className="text-ui-text">{d.year}</span>
                       </div>
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-ui-muted">
                          <span>Mention</span>
                          <span className="text-ui-text">{d.mention}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                       <button 
                         onClick={(e) => { e.stopPropagation(); downloadIPFSFile(d.ipfsHash, `DiploChain_${user?.name}_${d.id}.pdf`); }}
                         className="flex items-center justify-center gap-2 py-3 rounded-xl bg-ui-surface border border-ui-border text-[10px] font-black uppercase tracking-tighter hover:bg-ui-text hover:text-ui-bg transition-all"
                       >
                          <Download size={14} /> PDF
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); generateAttestationPDF(d); }}
                         className="flex items-center justify-center gap-2 py-3 rounded-xl bg-ui-surface border border-ui-border text-[10px] font-black uppercase tracking-tighter hover:bg-ui-text hover:text-ui-bg transition-all"
                       >
                          <Printer size={14} /> Preuve
                       </button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-5 flex items-center justify-between gap-6 group cursor-pointer" onClick={() => setSelectedDiploma(d)}>
                    <div className="flex items-center gap-6 min-w-0">
                       <div className="w-12 h-12 rounded-2xl bg-ui-surface flex items-center justify-center text-burkina-red border border-ui-border shadow-sm group-hover:scale-110 transition-transform">
                          <Award size={20} />
                       </div>
                       <div className="min-w-0">
                          <h3 className="text-sm font-bold text-ui-text uppercase truncate">{d.title}</h3>
                          <p className="text-[10px] text-ui-muted uppercase font-bold truncate">{d.institutionName} • {d.year}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="hidden md:flex flex-col text-right">
                          <span className="text-[9px] font-black text-ui-muted uppercase tracking-widest mb-1 italic">Matricule Blockchain</span>
                          <span className="text-[10px] font-mono font-bold text-burkina-red">{d.id}</span>
                       </div>
                       <div className="h-10 w-px bg-ui-border mx-2" />
                       <button 
                        onClick={(e) => { e.stopPropagation(); generateAttestationPDF(d); }}
                        className="p-3 rounded-xl bg-ui-surface border border-ui-border text-ui-muted hover:text-ui-text transition-all"
                       >
                          <Printer size={18} />
                       </button>
                       <ChevronRight size={20} className="text-ui-muted" />
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for details */}
        <AnimatePresence>
          {selectedDiploma && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-ui-bg/80 backdrop-blur-md"
                 onClick={() => setSelectedDiploma(null)}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-2xl bg-ui-card border-2 border-ui-border rounded-[40px] shadow-2xl overflow-hidden"
               >
                  <div className="p-10">
                     <div className="flex justify-between items-start mb-10">
                        <div>
                           <span className="px-3 py-1 rounded-full bg-burkina-green/10 text-burkina-green text-[10px] font-black uppercase tracking-widest">Détails Certifiés</span>
                           <h2 className="text-2xl font-bold text-ui-text mt-4 uppercase tracking-tighter">{selectedDiploma.title}</h2>
                        </div>
                        <button onClick={() => setSelectedDiploma(null)} className="p-3 rounded-full bg-ui-surface text-ui-muted hover:text-burkina-red transition-colors">
                           <AlertCircle size={24} className="rotate-45" />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Titulaire</p>
                           <p className="font-bold text-ui-text uppercase">{selectedDiploma.fullName}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Établissement</p>
                           <p className="font-bold text-ui-text uppercase">{selectedDiploma.institutionName}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Mention</p>
                           <p className="font-bold text-ui-text uppercase">{selectedDiploma.mention}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Année / Session</p>
                           <p className="font-bold text-ui-text uppercase">{selectedDiploma.year}</p>
                        </div>
                     </div>

                     <div className="p-6 rounded-3xl bg-ui-surface border border-ui-border mb-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 min-w-0">
                           <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest mb-1">Identifiant Blockchain Unique</p>
                           <p className="text-[10px] font-mono text-ui-text font-bold truncate">{selectedDiploma.id}</p>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => downloadQRCode(selectedDiploma.id)} className="p-3 rounded-xl bg-ui-bg border border-ui-border text-ui-muted hover:text-burkina-yellow transition-all" title="Télécharger QR Code">
                              <QrCode size={18} />
                           </button>
                           <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verifier?id=${selectedDiploma.id}`); alert("Lien copié !"); }} className="p-3 rounded-xl bg-ui-bg border border-ui-border text-ui-muted hover:text-burkina-red transition-all" title="Copier lien">
                              <Share2 size={18} />
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="primary" 
                          className="h-16 shadow-xl" 
                          icon={Download}
                          onClick={() => downloadIPFSFile(selectedDiploma.ipfsHash, `DiploChain_${selectedDiploma.fullName}_${selectedDiploma.id}.pdf`)}
                        >
                          TÉLÉCHARGER PDF
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-16 border-2" 
                          icon={Printer}
                          onClick={() => generateAttestationPDF(selectedDiploma)}
                        >
                          IMPRIMER PREUVE
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Diplome;
