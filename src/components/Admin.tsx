import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Upload, 
  Loader2, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  PlusCircle,
  Database,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { uploadToIPFS } from '../utils/ipfs';
import Button from './ui/Button';
import Card from './ui/Card';
import LoadingBlockchain from './ui/LoadingBlockchain';

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [institutionName, setInstitutionName] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    id: `DIPL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    fullName: '',
    birthDate: '',
    title: '',
    mention: 'Asser Bien',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      });
    }
  }, []);

  useEffect(() => {
    if (account) checkAuthorization();
  }, [account]);

  const checkConnection = async () => {
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
    }
  };

  const checkAuthorization = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const institution = await contract.institutions(account);
      if (institution.isRegistered) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', message: 'Veuillez sélectionner un fichier PDF' });

    setLoading(true);
    setStatus({ type: 'info', message: 'Phase 1/2 : Hébergement du document sur IPFS...' });

    try {
      const ipfsHash = await uploadToIPFS(file);

      setStatus({ type: 'info', message: 'Phase 2/2 : Signature blockchain en attente...' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.issueDiploma(
        formData.id,
        formData.fullName,
        formData.birthDate,
        formData.title,
        formData.mention,
        formData.year,
        ipfsHash
      );

      setStatus({ type: 'info', message: 'Transaction envoyée ! Confirmation en cours...' });
      await tx.wait();

      setStatus({ type: 'success', message: 'Diplôme certifié avec succès sur Polygon !' });
      setFile(null);
      // Generate new ID
      setFormData({
        ...formData,
        id: `DIPL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        fullName: '',
        birthDate: '',
        title: ''
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: "Échec : " + (err.reason || err.message) });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-40 px-4 text-center">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="bg-burkina-green/10 p-8 rounded-[40px] mb-8 border border-burkina-green/20"
        >
          <ShieldCheck size={80} className="text-burkina-green" />
        </motion.div>
        <h2 className="heading-lg text-ui-text mb-4">Espace Institutionnel</h2>
        <p className="body-lg mb-12 max-w-md">Connectez votre portefeuille MetaMask pour émettre des diplômes certifiés par DiploChain.</p>
        <Button size="lg" icon={Wallet} onClick={connectWallet}>
          Connecter Wallet
        </Button>
      </div>
    );
  }

  if (!isAuthorized && !loading && status.type !== 'success') {
    return (
      <div className="max-w-2xl mx-auto py-40 px-4 text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-burkina-red/10 p-8 rounded-[40px] mb-8 border border-burkina-red/20 inline-block"
        >
          <AlertCircle size={80} className="text-burkina-red" />
        </motion.div>
        <h2 className="heading-lg text-ui-text mb-4">Accès Non Autorisé</h2>
        <p className="body-lg mb-8">L'adresse <code className="text-burkina-red font-mono bg-ui-surface px-2 py-1 rounded">{account.substring(0, 8)}...</code> n'est pas accréditée par le Ministère de l'Enseignement Supérieur.</p>
        <div className="p-6 bg-ui-card border border-ui-border rounded-3xl text-sm font-mono break-all text-ui-muted">
          Veuillez contacter DiploChain pour obtenir une accréditation établissement.
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-32 px-4"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-3 py-1 rounded-full bg-burkina-green/10 border border-burkina-green/30 text-burkina-green text-[10px] font-black uppercase tracking-widest">
                Portail Accrédité ✓
             </div>
          </div>
          <h1 className="heading-xl text-ui-text tracking-tighter">
            Émettre un <span className="text-burkina-green">Diplôme</span>
          </h1>
          <p className="text-ui-muted mt-2 font-bold uppercase italic tracking-wider">{institutionName}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-ui-card border border-ui-border p-4 rounded-2xl flex flex-col items-center w-32 shadow-lg">
             <span className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Session</span>
             <span className="text-xl font-bold text-ui-text italic">2024</span>
          </div>
          <div className="bg-ui-card border border-ui-border p-4 rounded-2xl flex flex-col items-center w-32 shadow-lg">
             <span className="text-[10px] font-black text-ui-muted uppercase tracking-widest">Émis</span>
             <span className="text-xl font-bold text-burkina-yellow italic">124</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="py-20">
              <LoadingBlockchain message={status.message} />
            </Card>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8" hoverEffect={false}>
                <div className="flex items-center gap-3 mb-8 border-b border-ui-border pb-4">
                  <PlusCircle className="text-burkina-green" />
                  <h3 className="text-xl font-bold text-ui-text uppercase tracking-tight">Informations Académiques</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Matricule Diplôme</label>
                    <input 
                      type="text" 
                      value={formData.id}
                      onChange={(e) => setFormData({...formData, id: e.target.value})}
                      className="input-field w-full font-mono text-burkina-green font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Nom Complet</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Aminata Ouédraogo"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="input-field w-full font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Date de Naissance</label>
                    <input 
                      type="text" 
                      placeholder="JJ/MM/AAAA"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="input-field w-full font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Intitulé du Diplôme</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Licence en Informatique"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="input-field w-full font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Mention</label>
                    <div className="relative">
                      <select 
                        value={formData.mention}
                        onChange={(e) => setFormData({...formData, mention: e.target.value})}
                        className="input-field w-full appearance-none cursor-pointer font-bold"
                      >
                        {['Passable', 'Assez Bien', 'Bien', 'Très Bien', 'Excellent'].map(m => (
                          <option key={m} className="bg-ui-bg">{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Année</label>
                    <input 
                      type="number" 
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="input-field w-full font-bold"
                      required
                    />
                  </div>
                </div>
              </Card>

              {status.message && status.type !== 'info' && (
                <div className={`p-6 rounded-3xl border flex items-center gap-4 ${
                  status.type === 'error' ? 'bg-burkina-red/10 border-burkina-red/30 text-burkina-red' : 'bg-burkina-green/10 border-burkina-green/30 text-burkina-green'
                }`}>
                  {status.type === 'error' ? <AlertCircle /> : <CheckCircle2 />}
                  <span className="font-black uppercase italic tracking-tight">{status.message}</span>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <Card className="p-8" hoverEffect={false}>
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
                    onChange={(e) => setFile(e.target.files[0])}
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

                <div className="mt-8 p-6 bg-ui-surface rounded-2xl border border-ui-border">
                  <p className="text-[11px] text-ui-muted leading-relaxed font-bold uppercase tracking-tight">
                    Note : DiploChain utilise <span className="text-burkina-green underline decoration-2 underline-offset-4">Polygon</span> pour une sécurité maximale. Votre signature fait autorité d'État.
                  </p>
                </div>
              </Card>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full h-20 shadow-xl"
                icon={PlusCircle}
              >
                SIGNER & ÉMETTRE
              </Button>

              <Card className="bg-gradient-to-br from-burkina-green/10 to-burkina-red/5 border-ui-border p-6" hoverEffect={false}>
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
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
