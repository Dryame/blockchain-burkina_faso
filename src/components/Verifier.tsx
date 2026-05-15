import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Search, Loader2, Building, User, Calendar, ExternalLink } from 'lucide-react';
import { getContractReadOnly } from '../utils/blockchain';

export default function Verifier() {
  const [searchParams] = useSearchParams();
  const [diplomaId, setDiplomaId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setDiplomaId(idFromUrl);
      verify(idFromUrl);
    }
  }, [searchParams]);

  const verify = async (idToVerify?: string) => {
    const id = idToVerify || diplomaId;
    if (!id) return;

    setLoading(true);
    setResult(null);

    try {
      const contract = getContractReadOnly();
      const [data, exists] = await contract.verifyDiploma(id);
      
      setResult({
        isValid: exists,
        data: data
      });
    } catch (err) {
      console.error(err);
      setResult({ isValid: false, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-2">Vérification de Diplôme</h2>
        <p className="text-gray-400 italic">Plateforme officielle de lutte contre les faux diplômes – Burkina Faso</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 bg-[#121212] p-2 rounded-2xl shadow-2xl border border-white/5 mb-12">
        <input 
          type="text" 
          placeholder="Entrez le numéro du diplôme..."
          value={diplomaId}
          onChange={(e) => setDiplomaId(e.target.value)}
          className="flex-1 p-4 text-xl outline-none font-bold placeholder:font-normal bg-transparent text-white"
        />
        <button 
          onClick={() => verify()}
          disabled={loading}
          className="bg-[#EF2B2D] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#D12224] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          Vérifier
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden"
        >
          {result.isValid ? (
            <div className="bg-[#121212] rounded-3xl border-2 border-[#009A00] shadow-2xl overflow-hidden">
              <div className="bg-[#009A00] p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle2 size={48} className="shrink-0" />
                  <div>
                    <h3 className="text-3xl font-black leading-none">DIPLÔME VALIDE</h3>
                    <p className="opacity-90 mt-1">Certifié par DiploChain Blockchain</p>
                  </div>
                </div>
                <div className="hidden md:block opacity-20 transform -rotate-12 text-white">
                  <CheckCircle2 size={100} />
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="text-[#009A00] shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Titulaire</p>
                        <p className="text-xl font-bold text-gray-100">{result.data.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-[#009A00] shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Né(e) le</p>
                        <p className="text-lg font-bold text-gray-100">{result.data.birthDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building className="text-[#009A00] shrink-0 mt-1" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Établissement émetteur</p>
                        <p className="text-lg font-black text-[#009A00] uppercase leading-tight">{result.data.institutionName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mention</p>
                      <p className="text-lg font-bold text-gray-100">{result.data.mention}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 bg-white/5 -mx-8 px-8 pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h4 className="font-bold text-gray-100 text-lg uppercase leading-tight">{result.data.title}</h4>
                    <span className="bg-[#FCD116] text-[#009A00] px-3 py-1 rounded-full text-xs font-black uppercase text-center">Année {String(result.data.year)}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-gray-500 font-mono">
                    <p className="break-all flex-1">ID Blockchain: {result.data.ipfsHash}</p>
                    <a 
                      href={`https://amoy.polygonscan.com/address/${result.data.institutionAddress}`}
                      target="_blank" rel="noreferrer"
                      className="text-[#009A00] font-bold flex items-center gap-1 hover:underline whitespace-nowrap bg-[#1a1a1a] px-2 py-1 rounded shadow-sm border border-white/5"
                    >
                      Audit Ledger <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#121212] rounded-3xl border-4 border-dashed border-red-900/30 p-12 text-center shadow-inner">
              <XCircle size={80} className="text-[#EF2B2D] mx-auto mb-6" />
              <h3 className="text-3xl font-black text-[#EF2B2D] mb-4 uppercase">Diplôme Non Validé</h3>
              <p className="text-lg text-gray-400 max-w-lg mx-auto">
                L'identifiant <strong>{diplomaId}</strong> n'a pu être authentifié. 
                Ce numéro est inexistant ou non certifié.
              </p>
              <div className="mt-8 p-4 bg-red-950/20 text-red-500 text-sm rounded-xl font-medium inline-block border border-red-900/20">
                L'utilisation de faux diplômes est passible de poursuites judiciaires.
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
