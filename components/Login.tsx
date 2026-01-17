import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Banknote, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    } finally {
      setLoading(false);
    }
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
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Baruapepe</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        placeholder="mfano@kanisa.or.tz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nenosiri</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
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