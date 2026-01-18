import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/supabaseService';
import { User, Mail, Shield, Calendar, Lock, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
    const { profile, refreshProfile } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

    if (!profile) return null;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        if (password.length < 6) {
            setMsg({ type: 'error', text: 'Nenosiri lazima liwe na herufi angalau 6.' });
            return;
        }

        if (password !== confirmPassword) {
            setMsg({ type: 'error', text: 'Manenosiri hayafanani.' });
            return;
        }

        setLoading(true);
        try {
            await api.auth.changePassword(profile.id, password);
            setMsg({ type: 'success', text: 'Nenosiri limebadilishwa kikamilifu.' });
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMsg({ type: 'error', text: 'Imeshindikana kubadili nenosiri.' });
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role: string) => {
        switch(role) {
            case 'admin': return 'Msimamizi Mkuu';
            case 'pastor': return 'Mchungaji';
            case 'accountant': return 'Mhasibu';
            case 'mzee_wa_kanisa': return 'Mzee wa Kanisa';
            default: return role;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-slate-900">Wasifu Wangu</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Details Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold uppercase shadow-inner">
                                {profile.full_name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{profile.full_name}</h2>
                                <p className="text-slate-500 text-sm">{profile.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
                                    <Shield className="w-3 h-3" /> Nafasi
                                </div>
                                <div className="font-semibold text-slate-800">{getRoleLabel(profile.role)}</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
                                    <Calendar className="w-3 h-3" /> Tarehe ya Kusajiliwa
                                </div>
                                <div className="font-semibold text-slate-800">
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                                </div>
                            </div>
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                                <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold mb-1">
                                    <User className="w-3 h-3" /> Kitambulisho (ID)
                                </div>
                                <div className="font-mono text-xs text-slate-600 break-all">
                                    {profile.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-indigo-600" /> Usalama
                        </h3>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {msg && (
                                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                    {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
                                    <span>{msg.text}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nenosiri Mpya</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rudia Nenosiri</label>
                                <input 
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center text-sm"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Badili Nenosiri'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;