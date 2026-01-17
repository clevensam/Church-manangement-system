import React, { useState } from 'react';
import { api } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Save, Loader2, LogOut } from 'lucide-react';

const ChangePassword: React.FC = () => {
    const { profile, refreshProfile, signOut } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("Nenosiri lazima liwe na herufi angalau 6.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Manenosiri hayafanani.");
            return;
        }

        setLoading(true);

        try {
            if (profile) {
                await api.auth.changePassword(profile.id, password);
                await refreshProfile();
            }
        } catch (err: any) {
            setError(err.message || "Imeshindikana kubadili nenosiri.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                {/* Decorative Top Bar */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                
                <div className="p-8">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Badili Nenosiri</h2>
                    <p className="text-slate-500 text-sm text-center mb-8">
                        Kwa usalama wa mfumo, lazima ubadili nenosiri la muda ulilopewa kabla ya kuendelea.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nenosiri Mpya</label>
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rudia Nenosiri</label>
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Hifadhi na Endelea</>}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <button 
                            onClick={signOut}
                            className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Ghairi na Ondoka
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;