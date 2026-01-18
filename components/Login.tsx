import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Banknote, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // AuthProvider updates state, App.tsx renders content
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Hitilafu imetokea. Hakikisha baruapepe na nenosiri ni sahihi.');
      // UX: Clear password to force retry, but KEEP email to allow correction
      setPassword(''); 
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (isError: boolean) => {
      return `w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 transition-all ${
          isError 
            ? 'bg-rose-50 border-rose-300 text-rose-900 placeholder:text-rose-300 focus:ring-rose-200' 
            : 'bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:bg-white'
      }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                 <Banknote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KanisaFin</h1>
            <p className="text-emerald-100 text-sm font-medium mt-1">Mfumo wa Fedha wa Kanisa</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">Ingia kwenye Mfumo</h2>
            
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Baruapepe</label>
                    <input 
                        type="email" 
                        required
                        className={getInputClass(!!error)}
                        placeholder="mfano@kanisa.or.tz"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                        }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nenosiri</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            className={`${getInputClass(!!error)} pr-12`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(null);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Ficha nenosiri" : "Onyesha nenosiri"}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Inahakiki...
                        </>
                    ) : (
                        'Ingia'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    Kwa matumizi ya viongozi pekee. <br/> Wasiliana na msimamizi kama umesahau nenosiri.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;