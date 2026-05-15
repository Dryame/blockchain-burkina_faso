import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Building2, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { saveUser, checkDiplomaExistsForStudent } from '../utils/auth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Register: React.FC = () => {
  const [role, setRole] = useState<'institution' | 'graduate' | 'verifier'>('graduate');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    setLoading(true);

    try {
      saveUser({
        ...formData,
        role,
        createdAt: new Date().toISOString()
      });

      setStep(3); // Success step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ui-bg pt-32 pb-20 px-4">
      <div className="max-w-[480px] mx-auto">
        <div className="text-center mb-10 relative">
          <button 
            onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-black uppercase text-ui-muted hover:text-ui-text transition-all"
          >
            <ChevronLeft size={14} /> {step === 1 ? 'Accueil' : 'Retour'}
          </button>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-xl text-ui-text mb-2"
          >
            Créer un compte
          </motion.h1>
          <p className="text-ui-muted uppercase text-[10px] font-black tracking-[0.2em] italic">
            Rejoignez l'écosystème DiploChain ✓
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-center text-sm font-bold text-ui-text uppercase tracking-widest mb-8">Choisissez votre rôle</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'graduate', label: 'Diplômé du Burkina', sub: 'Gérez vos diplômes on-chain', icon: GraduationCap, color: 'text-burkina-green' },
                  { id: 'institution', label: 'Établissement Accrédité', sub: 'Émettez des diplômes sécurisés', icon: Building2, color: 'text-burkina-red' },
                  { id: 'verifier', label: 'Recruteur / Vérificateur', sub: 'Vérifiez l\'authenticité des profils', icon: Briefcase, color: 'text-burkina-yellow' }
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id as any)}
                    className={`flex items-center gap-6 p-6 rounded-3xl border-2 text-left transition-all group ${
                      role === r.id 
                        ? 'border-ui-text bg-ui-card' 
                        : 'border-ui-border bg-ui-surface hover:border-ui-text/30'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      role === r.id ? 'bg-ui-text text-ui-bg' : 'bg-ui-bg text-ui-muted group-hover:text-ui-text'
                    }`}>
                      <r.icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-[13px]">{r.label}</h3>
                      <p className="text-[11px] text-ui-muted uppercase font-bold tracking-tight">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button 
                variant="primary" 
                className="w-full h-14" 
                icon={ArrowRight}
                onClick={() => setStep(2)}
              >
                Continuer
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <form onSubmit={handleRegister} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-2xl bg-burkina-red/10 border border-burkina-red/20 text-burkina-red text-xs font-bold flex items-center gap-3">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">
                        {role === 'institution' ? "Nom de l'établissement" : "Nom complet"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="input-field w-full pl-12"
                          placeholder={role === 'institution' ? "Ex: Université Joseph Ki-Zerbo" : "Ex: Moussa Ouédraogo"}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted" size={18} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="input-field w-full pl-12"
                          placeholder="votre@email.bf"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Mot de passe</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-ui-muted uppercase tracking-widest ml-1">Confirmation</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Retour
                    </Button>
                    <Button 
                      type="submit"
                      variant="primary" 
                      className="flex-[2] h-14" 
                      disabled={loading}
                    >
                      {loading ? 'Vérification...' : 'Créer mon compte'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="p-12">
                <div className="w-24 h-24 rounded-full bg-burkina-green/10 flex items-center justify-center mx-auto mb-8 border-4 border-burkina-green/20">
                  <CheckCircle2 size={48} className="text-burkina-green" />
                </div>
                <h2 className="heading-lg text-ui-text mb-4">Compte Créé !</h2>
                <p className="text-ui-muted mb-10 italic">
                  Bienvenue sur DiploChain. Votre identité numérique a été validée avec succès sur le registre gouvernemental.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full h-14" icon={ArrowRight}>
                    Me connecter maintenant
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
