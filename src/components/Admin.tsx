import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getContract, formatBlockchainError } from '../utils/blockchain';
import { uploadToIPFS } from '../utils/ipfs';

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [institutionName, setInstitutionName] = useState("");
  const [isAccredited, setIsAccredited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Formulaire
  const [formData, setFormData] = useState({
    id: `DIPL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    birthDate: '',
    title: '',
    mention: 'Assez Bien',
    year: new Date().getFullYear(),
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        verifyAccreditation(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      verifyAccreditation(accounts[0]);
    } catch (err) {
      setStatus({ type: 'error', message: "Connexion MetaMask échouée." });
    }
  };

  const verifyAccreditation = async (addr) => {
    try {
      const contract = await getContract();
      const info = await contract.institutions(addr);
      setInstitutionName(info.name);
      setIsAccredited(info.isAccredited);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ type: 'error', message: "Veuillez uploader le PDF du diplôme." });
    
    setLoading(true);
    setStatus({ type: 'info', message: "Upload du PDF sur IPFS en cours..." });

    try {
      const ipfsHash = await uploadToIPFS(file);
      
      setStatus({ type: 'info', message: "Signature de la transaction blockchain..." });

      const contract = await getContract();
      const tx = await contract.emitDiploma(
        formData.id,
        formData.fullName,
        formData.birthDate,
        formData.title,
        formData.mention,
        formData.year,
        ipfsHash
      );

      await tx.wait();
      
      setStatus({ 
        type: 'success', 
        message: `Diplôme émis avec succès ! ID: ${formData.id}` 
      });
      
      setFormData({
        ...formData,
        id: `DIPL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: '',
        birthDate: '',
      });
      setFile(null);

    } catch (err) {
      setStatus({ type: 'error', message: formatBlockchainError(err) });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck size={64} className="text-[#009A00] mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Interface Établissement</h2>
        <p className="text-gray-400 mb-8 max-w-md">Connectez votre portefeuille MetaMask pour émettre des diplômes certifiés.</p>
        <button 
          onClick={connectWallet}
          className="bg-[#009A00] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#007A00] transition-all shadow-lg flex items-center gap-2"
        >
          Connecter MetaMask
        </button>
      </div>
    );
  }

  if (!isAccredited) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <AlertCircle size={64} className="text-[#EF2B2D] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Accès Non Autorisé</h2>
        <p className="text-gray-400 mb-4">L'adresse {account} n'est pas répertoriée comme établissement accrédité.</p>
        <div className="bg-white/5 border border-white/10 p-4 rounded text-xs font-mono break-all text-gray-500">{account}</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10 px-4"
    >
      <div className="bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-white/5">
        <div className="bg-gradient-to-r from-[#009A00] to-[#004d00] p-6 text-white leading-tight border-b border-white/10">
          <h2 className="text-2xl font-bold">Émettre un Diplôme Certifié</h2>
          <p className="opacity-90">{institutionName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">ID du Diplôme (Unique)</label>
              <input 
                type="text" 
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#009A00] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Nom Complet du Diplômé</label>
              <input 
                type="text" 
                placeholder="Ex: Aminata Ouédraogo"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#009A00] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Date de Naissance</label>
              <input 
                type="text" 
                placeholder="JJ/MM/AAAA"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#009A00] outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Intitulé du Diplôme</label>
              <input 
                type="text" 
                placeholder="Ex: Licence en Informatique"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#009A00] outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Mention</label>
                <select 
                  value={formData.mention}
                  onChange={(e) => setFormData({...formData, mention: e.target.value})}
                  className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none"
                >
                  <option className="bg-[#121212]">Passable</option>
                  <option className="bg-[#121212]">Assez Bien</option>
                  <option className="bg-[#121212]">Bien</option>
                  <option className="bg-[#121212]">Très Bien</option>
                  <option className="bg-[#121212]">Excellent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Année</label>
                <input 
                  type="number" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none"
                  required
                />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-400 mb-2">Fichier PDF du Diplôme</label>
              <div className="relative border-2 border-dashed border-white/10 bg-white/5 rounded-lg p-6 hover:border-[#009A00] transition-colors group">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="mx-auto text-gray-500 group-hover:text-[#009A00] mb-2" />
                  <p className="text-sm text-gray-500 overflow-hidden text-ellipsis px-2">
                    {file ? file.name : "Cliquez ou glissez le PDF ici"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {status.message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
                status.type === 'error' ? 'bg-red-950/20 text-red-500 border border-red-900/30' : 
                status.type === 'success' ? 'bg-green-950/20 text-green-500 border border-green-900/30' : 
                'bg-blue-950/20 text-blue-400 border border-blue-900/30'
              }`}>
                {status.type === 'error' ? <AlertCircle className="shrink-0" /> : <Loader2 className="animate-spin shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3 ${
                loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#EF2B2D] hover:bg-[#D12224] active:scale-95 shadow-[#EF2B2D]/10'
              }`}
            >
              {loading ? (
                <> <Loader2 className="animate-spin" /> Traitement en cours... </>
              ) : (
                <> <ShieldCheck /> Émettre le Diplôme sur Blockchain </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
