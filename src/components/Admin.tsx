import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Database, 
  ExternalLink, 
  Wallet,
  Trash2,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { uploadToIPFS } from '../utils/ipfs';
import Card from './ui/Card';
import Button from './ui/Button';
import LoadingBlockchain from './ui/LoadingBlockchain';
import { downloadIPFSFile } from '../utils/download';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 5;

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'issue' | 'list' | 'management'>('issue');
  const [account, setAccount] = useState<string | null>(user?.walletAddress || null);
  const [institutionName, setInstitutionName] = useState(user?.name || "");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [institutionsList, setInstitutionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState({ type: '', message: '', hash: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    id: `DIPL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    fullName: '',
    birthDate: '',
    studentId: '',
    title: '',
    mention: 'Assez Bien',
    year: new Date().getFullYear()
  });

  // List State
  const [issuedDiplomas, setIssuedDiplomas] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [mentionFilter, setMentionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (account) {
      checkAuthorization();
      checkIfOwner();
      fetchIssuedDiplomas();
    }
  }, [account]);

  const checkConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) setAccount(accounts[0]);
    }
  };

  const checkAuthorization = async () => {
    if (!account || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const institution = await contract.institutions(account);
      if (institution.isAccredited) {
        setIsAuthorized(true);
        setInstitutionName(institution.name);
      } else {
        setIsAuthorized(false);
      }
    } catch (err) {
      console.error(err);
      setIsAuthorized(false);
    }
  };

  const checkIfOwner = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account?.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssuedDiplomas = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const filter = contract.filters.DiplomaEmitted(null, account);
      const events = await contract.queryFilter(filter, 0);
      
      const diplomas = await Promise.all(events.map(async (event: any) => {
        try {
          const id = event.args[0];
          const [data] = await contract.verifyDiploma(id);
          return {
            id,
            fullName: data.fullName,
            title: data.title,
            mention: data.mention,
            year: Number(data.year),
            timestamp: Number(data.timestamp),
            ipfsHash: data.ipfsHash,
            txHash: event.transactionHash
          };
        } catch (e) {
          return null;
        }
      }));
      
      setIssuedDiplomas(diplomas.filter(d => d !== null).sort((a: any, b: any) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Failed to fetch diplomas", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const filter = contract.filters.InstitutionAccredited();
      const events = await contract.queryFilter(filter, 0);
      
      const uniqueAddresses = [...new Set(events.map(e => {
        if ('args' in e && e.args) return e.args[0] as string;
        return null;
      }).filter((a): a is string => a !== null))];
      
      const list = await Promise.all(uniqueAddresses.map(async (addr) => {
        const info = await contract.institutions(addr);
        return {
          address: addr,
          name: info.name,
          isAccredited: info.isAccredited
        };
      }));
      
      setInstitutionsList(list);
    } catch (err) {
      console.error("Error fetching institutions", err);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', message: 'Veuillez sélectionner un fichier PDF', hash: '' });

    setLoading(true);
    setStatus({ type: 'info', message: 'Préparation du fichier...', hash: '' });

    try {
      // Check if ID already exists
      const providerRead = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
      const contractRead = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerRead);
      const [_, isValid] = await contractRead.verifyDiploma(formData.id);
      if (isValid) {
        throw new Error("Ce matricule existe déjà dans la blockchain.");
      }

      // Step 2: Upload to IPFS
      setStatus({ type: 'info', message: 'Upload IPFS en cours...', hash: '' });
      setUploadProgress(30);
      const ipfsHash = await uploadToIPFS(file);
      setUploadProgress(60);

      // Step 3: Blockchain Transaction
      setStatus({ type: 'warning', message: 'Signature MetaMask requise...', hash: '' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const formattedBirthDate = formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('fr-FR') : '';

      const tx = await contract.emitDiploma(
        formData.id,
        formData.fullName,
        formattedBirthDate,
        formData.title,
        formData.mention,
        formData.year,
        ipfsHash
      );

      setStatus({ type: 'warning', message: 'Transaction en cours...', hash: tx.hash });
      setUploadProgress(85);
      await tx.wait();
      
      setUploadProgress(100);
      setStatus({ type: 'success', message: 'Diplôme émis avec succès !', hash: tx.hash });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CE1126', '#009E49', '#FCD116']
      });

      // Refresh list
      fetchIssuedDiplomas();
      
      // Reset Form
      setFormData({
        id: `DIPL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        fullName: '',
        birthDate: '',
        studentId: '',
        title: '',
        mention: 'Assez Bien',
        year: new Date().getFullYear()
      });
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: "Échec : " + (err.reason || err.message), hash: '' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Filters and Search
  const availableYears = useMemo(() => {
    const years = issuedDiplomas.map(d => d.year.toString());
    return [...new Set(years)].sort((a, b) => b.localeCompare(a));
  }, [issuedDiplomas]);

  const availableMentions = useMemo(() => {
    const mentions = issuedDiplomas.map(d => d.mention);
    return [...new Set(mentions)].sort();
  }, [issuedDiplomas]);

  const filteredDiplomas = useMemo(() => {
    return issuedDiplomas.filter(d => {
      const matchesSearch = d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === 'All' || d.year.toString() === yearFilter;
      const matchesMention = mentionFilter === 'All' || d.mention === mentionFilter;
      return matchesSearch && matchesYear && matchesMention;
    });
  }, [issuedDiplomas, searchQuery, yearFilter, mentionFilter]);

  const pagedDiplomas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDiplomas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDiplomas, currentPage]);

  const totalPages = Math.ceil(filteredDiplomas.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-ui-bg pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                isAuthorized ? 'bg-burkina-green/10 border-burkina-green/30 text-burkina-green' : 'bg-burkina-red/10 border-burkina-red/30 text-burkina-red'
              }`}>
                {isAuthorized ? 'Établissement Accrédité ✓' : 'Accréditation Non Détectée'}
              </div>
            </div>
            <h1 className="heading-xl text-ui-text tracking-tighter">
              Portail <span className="text-burkina-green">Administration</span>
            </h1>
            <p className="text-ui-muted mt-2 font-bold uppercase italic tracking-wider flex items-center gap-2">
              <Building2 size={16} /> {institutionName}
            </p>
          </div>

          <div className="flex gap-4 p-2 bg-ui-card border border-ui-border rounded-3xl">
            {[
              { id: 'issue', label: 'Émission', icon: PlusCircle },
              { id: 'list', label: 'Registre', icon: Database },
              { id: 'management', label: 'Gestion', icon: ShieldCheck, show: isOwner }
            ].filter(t => t.show !== false).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${
                  activeTab === t.id 
                    ? 'bg-ui-text text-ui-bg font-black' 
                    : 'text-ui-muted hover:text-ui-text font-bold'
                }`}
              >
                <t.icon size={18} />
                <span className="text-xs uppercase tracking-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: ISSUE DIPLOMA */}
          {activeTab === 'issue' && (
            <motion.div
              key="issue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-8 border-b border-ui-border pb-4">
                    <PlusCircle className="text-burkina-green" />
                    <h3 className="text-xl font-bold text-ui-text uppercase tracking-tight">Nouvelle Émission</h3>
                  </div>

                  <form onSubmit={handleIssue} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Matricule Blockchain</label>
                      <input 
                        type="text" 
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                        className="input-field w-full font-mono text-burkina-green font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Nom Complet du Diplômé</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Alimatou Diallo"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="input-field w-full font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Date de Naissance</label>
                      <input 
                        type="date" 
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="input-field w-full font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Numéro Étudiant</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 202400123"
                        value={formData.studentId}
                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                        className="input-field w-full font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Intitulé du Diplôme</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Master en Gestion de Projets"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="input-field w-full font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Mention</label>
                      <select 
                        value={formData.mention}
                        onChange={(e) => setFormData({...formData, mention: e.target.value})}
                        className="input-field w-full font-bold"
                      >
                        {['Passable', 'Assez Bien', 'Bien', 'Très Bien', 'Excellent'].map(m => (
                          <option key={m} value={m} className="bg-ui-bg">{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Année d'obtention</label>
                      <input 
                        type="number" 
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="input-field w-full font-bold"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 pt-6">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full h-16 shadow-xl"
                        disabled={loading || !isAuthorized}
                        icon={ShieldCheck}
                      >
                        {loading ? 'Traitement en cours...' : 'SIGNER & ÉMETTRE SUR LA BLOCKCHAIN'}
                      </Button>
                    </div>
                  </form>
                </Card>

                {status.message && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                      status.type === 'error' ? 'bg-burkina-red/10 border-burkina-red/20 text-burkina-red' : 
                      status.type === 'success' ? 'bg-burkina-green/10 border-burkina-green/20 text-burkina-green' :
                      'bg-burkina-yellow/10 border-burkina-yellow/20 text-burkina-yellow'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {status.type === 'error' ? <AlertCircle /> : status.type === 'success' ? <CheckCircle2 /> : <Loader2 className="animate-spin" />}
                      <span className="font-black uppercase italic tracking-tight">{status.message}</span>
                    </div>
                    {status.hash && (
                      <a 
                        href={`https://amoy.polygonscan.com/tx/${status.hash}`}
                        target="_blank"
                        className="text-[10px] font-mono underline hover:no-underline flex items-center gap-2 pl-10"
                      >
                        Voir sur Polygonscan <ExternalLink size={10} />
                      </a>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="space-y-8">
                {/* IPFS Upload Card */}
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-burkina-red" />
                    <h3 className="text-base font-bold text-ui-text uppercase tracking-tight">Fichier IPFS</h3>
                  </div>
                  
                  <div className={`border-2 border-dashed rounded-3xl p-8 transition-all relative group overflow-hidden ${
                    file ? 'border-burkina-green bg-burkina-green/5' : 'border-ui-border hover:border-burkina-red'
                  }`}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center relative z-0">
                      <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        file ? 'bg-burkina-green text-white' : 'bg-ui-surface text-ui-muted group-hover:text-burkina-red'
                      }`}>
                        <Upload size={32} />
                      </div>
                      {file ? (
                        <p className="text-[13px] font-bold text-ui-text break-all px-2">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-xs font-black text-ui-text mb-1 uppercase tracking-widest italic">PDF Source</p>
                          <p className="text-[9px] text-ui-muted uppercase font-bold tracking-widest">Signer numériquement</p>
                        </>
                      )}
                    </div>
                  </div>

                  {loading && uploadProgress > 0 && (
                    <div className="mt-6 space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase text-ui-muted">
                        <span>Progression</span>
                        <span>{uploadProgress}%</span>
                       </div>
                       <div className="w-full h-2 bg-ui-surface rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-burkina-green"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                       </div>
                    </div>
                  )}
                </Card>

                {/* Preview Card */}
                <Card className="p-6 bg-ui-surface border-ui-border" hoverEffect={false}>
                  <h4 className="text-[10px] font-black text-ui-muted uppercase tracking-widest mb-4">Aperçu direct</h4>
                  <div className="p-4 rounded-xl bg-ui-bg border border-ui-border">
                    <p className="text-sm font-bold text-ui-text uppercase mb-1">{formData.fullName || '---'}</p>
                    <p className="text-[10px] font-bold text-ui-muted uppercase tracking-tighter">{formData.title || 'Intitulé du diplôme'}</p>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-ui-border">
                      <span className="text-[9px] font-black text-burkina-red uppercase">{formData.id}</span>
                      <span className="text-[9px] font-black text-burkina-green uppercase">{formData.year}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DIPLOMA LIST */}
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom ou matricule..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full pl-12 h-14"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={16} />
                  <select 
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="input-field w-full pl-12 h-14 font-bold"
                  >
                    <option value="All">Toutes les années</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                   <select 
                    value={mentionFilter}
                    onChange={(e) => setMentionFilter(e.target.value)}
                    className="input-field w-full h-14 font-bold"
                  >
                    <option value="All">Toutes les mentions</option>
                    {availableMentions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <Card className="overflow-hidden p-0" hoverEffect={false}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ui-surface border-b border-ui-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">ID / Matricule</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">Diplômé</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">Titre</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">Mention</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest">Année</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-ui-muted tracking-widest text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDiplomas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center italic text-ui-muted">
                            Aucun diplôme trouvé dans le registre.
                          </td>
                        </tr>
                      ) : (
                        pagedDiplomas.map((diploma, idx) => (
                          <motion.tr 
                            key={diploma.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-ui-border/50 hover:bg-ui-surface/50 transition-colors group"
                          >
                            <td className="px-6 py-4 font-mono text-[11px] font-bold text-burkina-red">{diploma.id}</td>
                            <td className="px-6 py-4 font-bold text-ui-text uppercase text-[12px]">{diploma.fullName}</td>
                            <td className="px-6 py-4 font-medium text-ui-muted text-[11px] uppercase">{diploma.title}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full bg-ui-card border border-ui-border text-[9px] font-black uppercase text-ui-text">
                                {diploma.mention}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-black text-[11px]">{diploma.year}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => downloadIPFSFile(diploma.ipfsHash, `Diploma_${diploma.id}.pdf`)}
                                  className="p-2 rounded-lg bg-ui-bg border border-ui-border text-ui-muted hover:text-burkina-green hover:border-burkina-green transition-all"
                                  title="Télécharger PDF"
                                >
                                  <Download size={14} />
                                </button>
                                <a 
                                  href={`https://amoy.polygonscan.com/tx/${diploma.txHash}`}
                                  target="_blank"
                                  className="p-2 rounded-lg bg-ui-bg border border-ui-border text-ui-muted hover:text-burkina-yellow hover:border-burkina-yellow transition-all"
                                  title="Voir sur Polygonscan"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                   <div className="flex items-center justify-between px-6 py-4 bg-ui-surface border-t border-ui-border">
                    <p className="text-[10px] font-bold text-ui-muted uppercase">Page {currentPage} sur {totalPages}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={16} /> Précédent
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      >
                        Suivant <ChevronRight size={16} />
                      </Button>
                    </div>
                   </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* TAB 3: MANAGEMENT (OWNER ONLY) */}
          {activeTab === 'management' && isOwner && (
            <motion.div
              key="mgmt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Building2 className="text-burkina-green" />
                      <h3 className="text-lg font-bold text-ui-text uppercase tracking-tight">Institutions On-Chain</h3>
                    </div>
                    <Button size="sm" variant="ghost" onClick={fetchInstitutions} disabled={loadingInstitutions}>
                      {loadingInstitutions ? <Loader2 className="animate-spin" size={16} /> : "Rafraîchir"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {loadingInstitutions ? (
                      <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-burkina-green" />
                        <span className="text-[10px] font-black text-ui-muted uppercase">Récupération...</span>
                      </div>
                    ) : institutionsList.length === 0 ? (
                      <p className="text-center py-10 italic text-ui-muted text-sm">Charger les institutions pour voir la liste.</p>
                    ) : (
                      institutionsList.map((inst: any) => (
                        <div key={inst.address} className="p-4 rounded-2xl bg-ui-surface border border-ui-border flex items-center justify-between group">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-ui-text uppercase">{inst.name}</span>
                            <span className="text-[9px] font-mono text-ui-muted">{inst.address}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              inst.isAccredited ? 'bg-burkina-green/10 text-burkina-green' : 'bg-burkina-red/10 text-burkina-red'
                            }`}>
                              {inst.isAccredited ? 'Actif' : 'Révoqué'}
                            </span>
                            {inst.isAccredited && (
                               <button 
                                onClick={async () => {
                                   if (!confirm("Voulez-vous vraiment révoquer cette institution ?")) return;
                                   try {
                                      setLoading(true);
                                      const provider = new ethers.BrowserProvider(window.ethereum);
                                      const signer = await provider.getSigner();
                                      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                                      const tx = await contract.revokeInstitution(inst.address);
                                      await tx.wait();
                                      fetchInstitutions();
                                   } catch (e: any) {
                                      alert("Erreur: " + (e.reason || e.message));
                                   } finally {
                                      setLoading(false);
                                   }
                                }}
                                className="p-2 text-ui-muted hover:text-burkina-red opacity-0 group-hover:opacity-100 transition-all"
                               >
                                <Trash2 size={14} />
                               </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-8 h-fit">
                  <div className="flex items-center gap-3 mb-8">
                    <UserPlus className="text-burkina-yellow" />
                    <h3 className="text-lg font-bold text-ui-text uppercase tracking-tight">Nouvelle Accréditation</h3>
                  </div>
                  <p className="text-ui-muted text-sm mb-8 leading-relaxed font-medium">
                    Ajoutez une institution partenaire au registre officiel. Elle pourra alors émettre des diplômes certifiés par DiploChain.
                  </p>
                  
                  <form className="space-y-6" onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as any;
                    const addr = target.address.value;
                    const name = target.name.value;
                    if (!ethers.isAddress(addr)) return alert("Adresse invalide");

                    setLoading(true);
                    try {
                      const provider = new ethers.BrowserProvider(window.ethereum);
                      const signer = await provider.getSigner();
                      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                      const tx = await contract.addInstitution(addr, name);
                      await tx.wait();
                      fetchInstitutions();
                      target.reset();
                    } catch (err: any) {
                      alert("Erreur: " + (err.reason || err.message));
                    } finally {
                      setLoading(false);
                    }
                  }}>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Adresse Blockchain</label>
                       <input name="address" type="text" placeholder="0x..." className="input-field w-full font-mono text-xs" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Nom de l'Institution</label>
                       <input name="name" type="text" placeholder="Ex: École Normale Supérieure" className="input-field w-full font-bold" required />
                    </div>
                    <Button type="submit" variant="primary" className="w-full h-14" disabled={loading} icon={CheckCircle2}>
                      {loading ? "Traitement..." : "Accréditer l'Institution"}
                    </Button>
                  </form>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audit Footer */}
        <Card className="mt-12 bg-gradient-to-br from-burkina-green/10 to-burkina-red/5 border-ui-border p-6" hoverEffect={false}>
           <div className="flex flex-col gap-2 font-mono">
              <span className="text-[10px] font-black text-ui-muted uppercase">Audit Ledger</span>
              <a 
                href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                className="text-burkina-green text-[11px] flex items-center gap-2 hover:underline font-bold"
              >
                On-Chain Registry <ExternalLink size={10} />
              </a>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
