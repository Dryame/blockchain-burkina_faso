import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  Zap, 
  Globe, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  const stats = [
    { label: "Faux Diplômes Éliminés", value: "30%", icon: <ShieldAlert className="text-burkina-red" /> },
    { label: "Temps de Vérification", value: "3s", icon: <Clock className="text-burkina-yellow" /> },
    { label: "Sécurité Blockchain", value: "100%", icon: <Zap className="text-burkina-green" /> }
  ];

  const steps = [
    { 
      title: "Accréditation", 
      desc: "Le Ministère valide l'établissement sur le réseau.",
      icon: <Award className="text-burkina-green" size={32} />
    },
    { 
      title: "Ancrage", 
      desc: "Le diplôme est signé et gravé dans un bloc immuable.",
      icon: <TrendingUp className="text-burkina-red" size={32} />
    },
    { 
      title: "Vérification", 
      desc: "Le recruteur scanne et confirme l'authenticité direct.",
      icon: <Search className="text-burkina-yellow" size={32} />
    }
  ];

  return (
    <div className="pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-burkina-green/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burkina-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-burkina-green"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-burkina-green">
              Live sur Polygon Amoy Testnet
            </span>
          </div>

          <h1 className="heading-xl text-ui-text mb-6">
            L'EXCELLENCE DU <span className="text-burkina-green italic underline decoration-burkina-green/20 underline-offset-8">BURKINA</span> <br /> 
            GRAVÉE DANS LA <span className="text-burkina-red italic">BLOCKCHAIN</span>
          </h1>
          
          <p className="body-lg max-w-3xl mx-auto mb-12 italic opacity-90">
            DiploChain assure l'authenticité des diplômes universitaires pour restaurer la confiance entre les institutions, les diplômés et les recruteurs du Burkina Faso.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/verifier">
              <Button size="lg" variant="primary" icon={Search}>
                VÉRIFIER MAINTENANT
              </Button>
            </Link>
            <Link to="/diplome">
              <Button size="lg" variant="ghost" icon={Award}>
                MON ESPACE DIPLÔMÉ
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="flex flex-col items-center text-center py-10" glare={false}>
                <div className="mb-4 bg-ui-surface p-4 rounded-2xl">
                  {React.cloneElement(stat.icon, { size: 32 })}
                </div>
                <span className="text-4xl font-heading font-black text-ui-text mb-2 tracking-tighter">{stat.value}</span>
                <span className="text-xs uppercase tracking-widest font-black text-ui-muted">{stat.label}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-40 bg-ui-surface/50 border-y border-ui-border px-10 py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <h2 className="heading-lg text-ui-text mb-16 tracking-tighter">
                LE PROTOCOLE <span className="text-burkina-yellow italic underline decoration-8 underline-offset-12">DE CONFIANCE</span>
              </h2>
              <div className="space-y-12">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center shrink-0 shadow-xl border-ui-border">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-ui-text mb-2 uppercase tracking-tight">{step.title}</h3>
                      <p className="text-ui-muted text-base leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full aspect-square max-w-md mx-auto"
              >
                <div className="w-full h-full glass-card border-burkina-green/20 p-8 flex items-center justify-center relative">
                  <ShieldCheck size={200} className="text-burkina-green opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={100} className="text-burkina-yellow animate-float" />
                  </div>
                  {/* Decorative orbital rings */}
                  <div className="absolute inset-0 border-2 border-white/5 rounded-full scale-110 animate-pulse" />
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-125 animate-ping" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-black text-ui-muted mb-16 tracking-[0.3em] uppercase italic">
          LES ÉTABLISSEMENTS <span className="text-burkina-green">ACCRÉDITÉS</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Placeholders for logos since we don't have images */}
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="flex items-center gap-3">
               <BookOpen size={40} className="text-ui-muted" />
               <div className="flex flex-col items-start translate-y-1">
                 <div className="w-24 h-2 bg-ui-muted rounded-full mb-1" />
                 <div className="w-16 h-2 bg-ui-muted/50 rounded-full" />
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-ui-card border-burkina-red/30">
          <h2 className="text-3xl md:text-4xl font-bold text-ui-text mb-6 uppercase tracking-tighter">
            REJOIGNEZ LA <span className="text-burkina-red">RÉVOLUTION</span>
          </h2>
          <p className="text-lg text-ui-muted mb-10 font-medium">
            Diplômés, institutions ou recruteurs : adoptez le standard de confiance du Burkina Faso.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/admin">
              <Button variant="danger" icon={ShieldCheck}>ADMINISTRATION</Button>
            </Link>
            <Button variant="outline" icon={ArrowRight}>CONTACTER LE MINISTÈRE</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
