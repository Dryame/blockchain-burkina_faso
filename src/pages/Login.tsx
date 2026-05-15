import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Wallet, 
  ArrowRight, 
  AlertCircle,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { findUser, createSession } from '../utils/auth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const [role, setRole] = useState<'institution' | 'graduate' | 'verifier'>('graduate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = findUser(email, password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (user.role !== role) {
        throw new Error(`Ce compte n'est pas enregistré comme ${role === 'institution' ? 'Établissement' : role === 'graduate' ? 'Diplômé' : 'Vérificateur'}`);
      }

      const session = createSession(user, rememberMe);
      login(session, rememberMe);
      
      // Redirect based on role
      if (role === 'institution') navigate('/admin');
      else if (role === 'graduate') navigate('/espace-diplome');
      else navigate('/verifier');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      setError('MetaMask n\'est pas installé');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Find user by wallet address
      const users = JSON.parse(localStorage.getItem('diplo_users') || '[]');
      const user = users.find((u: any) => u.walletAddress?.toLowerCase() === address.toLowerCase());
      
      if (!user) {
        throw new Error('Aucun compte lié à cette adresse wallet. Veuillez vous inscrire d\'abord.');
      }

      const session = createSession(user, true);
      login(session, true);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg pt-32 pb-20 px-4">
      <div className="max-w-[440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative"
        >
          <button 
            onClick={() => navigate('/')}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-black uppercase text-ui-muted hover:text-ui-text transition-all"
          >
            <ChevronLeft size={14} /> Retour
          </button>
          <h1 className="heading-xl text-ui-text mb-2">Connectez-vous</h1>
          <p className="text-ui-muted uppercase text-[10px] font-black tracking-[0.2em] italic">
            Accès sécurisé à DiploChain ✓
          </p>
        </motion.div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: 'graduate', label: 'Diplômé', icon: GraduationCap },
            { id: 'institution', label: 'Établissement', icon: Building2 },
            { id: 'verifier', label: 'Vérificateur', icon: Briefcase }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id as any)}
              className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 ${
                role === r.id 
                  ? 'border-burkina-red bg-burkina-red/5 text-ui-text' 
                  : 'border-ui-border bg-ui-card text-ui-muted hover:border-ui-text/30'
              }`}
            >
              <r.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-tight">{r.label}</span>
            </button>
          ))}
        </div>

        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-burkina-red/10 border border-burkina-red/20 text-burkina-red text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="nom@exemple.bf"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                  rememberMe ? 'bg-burkina-red border-burkina-red' : 'border-ui-border bg-ui-surface group-hover:border-ui-text/30'
                }`}>
                  {rememberMe && <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-0.5" />}
                </div>
                <span className="text-[11px] font-black text-ui-muted uppercase tracking-tight">Se souvenir de moi</span>
              </label>
              
              <Link to="/recovery" className="text-[11px] font-black text-burkina-red uppercase tracking-tight hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-14"
              icon={ArrowRight}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            {role === 'institution' && (
              <div className="relative pt-4 text-center">
                <div className="absolute inset-0 top-1/2 h-px bg-ui-border" />
                <span className="relative z-10 px-4 bg-ui-card text-[10px] font-black text-ui-muted uppercase tracking-[0.2em]">Ou</span>
              </div>
            )}

            {role === 'institution' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full h-14 border-ui-border"
                onClick={handleMetaMaskLogin}
                icon={Wallet}
              >
                Accès via MetaMask
              </Button>
            )}
          </form>
        </Card>

        <p className="mt-8 text-center text-[12px] font-medium text-ui-muted">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-burkina-red font-black uppercase tracking-tight hover:underline">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
