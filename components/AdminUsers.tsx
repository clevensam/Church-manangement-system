import React, { useState, useEffect } from 'react';
import { api } from '../services/supabaseService';
import { User, UserRole } from '../types';
import { Plus, Search, Shield, ShieldCheck, User as UserIcon, Lock, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import LoadingCross from './LoadingCross';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
      full_name: '',
      email: '',
      password: '',
      role: 'mzee_wa_kanisa' as UserRole
  });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
        const data = await api.admin.getAllUsers();
        setUsers(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
      switch(role) {
          case 'admin': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span>;
          case 'pastor': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><UserIcon className="w-3 h-3" /> Mchungaji</span>;
          case 'accountant': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center w-fit gap-1"><Shield className="w-3 h-3" /> Mhasibu</span>;
          default: return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold flex items-center w-fit gap-1"><UserIcon className="w-3 h-3" /> Mzee wa Kanisa</span>;
      }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      setErrorMsg(null);
      
      try {
          await api.admin.createUser(newUser);
          setSuccessMsg('Mtumiaji ameundwa kikamilifu!');
          setNewUser({ full_name: '', email: '', password: '', role: 'mzee_wa_kanisa' });
          setIsModalOpen(false);
          loadUsers();
          setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
          setErrorMsg(err.message || 'Hitilafu imetokea.');
      } finally {
          setCreating(false);
      }
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-slate-900">Utawala</h1>
              <p className="text-slate-500 text-sm">Dhibiti watumiaji wa mfumo na majukumu yao.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-md transition-all font-medium text-sm"
          >
              <Plus className="w-4 h-4 mr-2" /> Sajili Mtumiaji
          </button>
       </div>

       {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-3" />
                <span className="font-medium">{successMsg}</span>
            </div>
        )}

       {/* Search */}
       <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-md">
           <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Tafuta jina au barua pepe..."
                  className="w-full pl-9 pr-4 py-2 bg-transparent outline-none text-sm text-slate-700"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
           </div>
       </div>

       {/* Users List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           {loading ? (
               <div className="p-8"><LoadingCross /></div>
           ) : (
               <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                       <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900 uppercase tracking-wider text-xs">
                           <tr>
                               <th className="px-6 py-4">Mtumiaji</th>
                               <th className="px-6 py-4">Nafasi</th>
                               <th className="px-6 py-4">Hali</th>
                               <th className="px-6 py-4">Tarehe ya Kusajiliwa</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {filteredUsers.length === 0 ? (
                               <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Hakuna watumiaji.</td></tr>
                           ) : (
                               filteredUsers.map(user => (
                                   <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                       <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                               <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase shrink-0">
                                                   {user.full_name?.charAt(0) || 'U'}
                                               </div>
                                               <div>
                                                   <p className="font-bold text-slate-900">{user.full_name}</p>
                                                   <p className="text-xs text-slate-500">{user.email}</p>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4">
                                           {getRoleBadge(user.role)}
                                       </td>
                                       <td className="px-6 py-4">
                                           {user.must_change_password ? (
                                               <span className="flex items-center text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full w-fit">
                                                   <Lock className="w-3 h-3 mr-1" /> Badili Nenosiri
                                               </span>
                                           ) : (
                                               <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                   <CheckCircle2 className="w-3 h-3 mr-1" /> Amekamilika
                                               </span>
                                           )}
                                           {user.last_sign_in_at && (
                                               <div className="text-[10px] text-slate-400 mt-1">
                                                   Mara ya mwisho: {new Date(user.last_sign_in_at).toLocaleDateString()}
                                               </div>
                                           )}
                                       </td>
                                       <td className="px-6 py-4 text-slate-500">
                                           {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                       </td>
                                   </tr>
                               ))
                           )}
                       </tbody>
                   </table>
               </div>
           )}
       </div>

       {/* Create User Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="font-bold text-slate-900">Sajili Mtumiaji Mpya</h3>
                       <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   
                   <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                       {errorMsg && (
                           <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-lg flex items-start gap-2">
                               <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                               <span>{errorMsg}</span>
                           </div>
                       )}
                       
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Jina Kamili</label>
                           <input 
                                type="text" required 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                value={newUser.full_name}
                                onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Barua Pepe</label>
                           <input 
                                type="email" required 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                value={newUser.email}
                                onChange={e => setNewUser({...newUser, email: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Nafasi</label>
                           <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                           >
                               <option value="mzee_wa_kanisa">Mzee wa Kanisa</option>
                               <option value="accountant">Mhasibu</option>
                               <option value="pastor">Mchungaji</option>
                               <option value="admin">Admin</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Nenosiri la Muda</label>
                           <input 
                                type="text" required minLength={6}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                                value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})}
                           />
                           <p className="text-xs text-slate-500 mt-1">Mtumiaji atalazimika kubadili nenosiri hili pindi atakapoingia.</p>
                       </div>

                       <button 
                            type="submit" 
                            disabled={creating}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center mt-2"
                       >
                           {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sajili Mtumiaji'}
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default AdminUsers;