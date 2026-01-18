import React, { useState, useEffect } from 'react';
import { api } from '../services/supabaseService';
import { RegularOffering, EnvelopeOffering, ServiceType, Donor } from '../types';
import { Plus, Wallet, Save, Search, X, Edit2, Trash2, AlertTriangle, Filter, Calendar, Users, CheckCircle2, Lock } from 'lucide-react';
import LoadingCross from './LoadingCross';
import { useAuth } from '../contexts/AuthContext';

interface OfferingsProps {
    viewMode?: 'list' | 'add';
}

const Offerings: React.FC<OfferingsProps> = ({ viewMode = 'list' }) => {
  const { profile } = useAuth();
  
  // Specific role check for view restriction
  const isMzeeWaKanisa = profile?.role === 'mzee_wa_kanisa';
  const isAccountant = profile?.role === 'accountant';

  // If leader, default to 'envelope', else 'regular'
  const [activeTab, setActiveTab] = useState<'regular' | 'envelope'>(
      isMzeeWaKanisa ? 'envelope' : 'regular'
  );

  const [regularOfferings, setRegularOfferings] = useState<RegularOffering[]>([]);
  const [envOfferings, setEnvOfferings] = useState<EnvelopeOffering[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Permissions
  const canManageRegular = profile?.role === 'accountant' || profile?.role === 'admin';
  const canManageEnvelope = profile?.role === 'mzee_wa_kanisa' || profile?.role === 'admin';
  
  // Data for Lookups
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Forms
  const [regularForm, setRegularForm] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: ServiceType.FIRST,
    amount: 0
  });

  const [envForm, setEnvForm] = useState({
    offering_date: new Date().toISOString().split('T')[0],
    envelope_number: '',
    amount: 0,
    bahasha_type: 'Ahadi' // Default
  });
  
  // Donor Lookup State
  const [matchedDonor, setMatchedDonor] = useState<Donor | null>(null);

  const [displayAmount, setDisplayAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState<{id: string, type: 'regular' | 'envelope'} | null>(null);

  useEffect(() => {
    // Force activeTab on mount/change if leader (safeguard)
    if (isMzeeWaKanisa && activeTab !== 'envelope') {
        setActiveTab('envelope');
        return;
    }
    // Force activeTab if accountant (safeguard)
    if (isAccountant && activeTab !== 'regular') {
        setActiveTab('regular');
        return;
    }

    if (viewMode === 'list') {
        loadData();
    } else {
        resetForm();
    }
    // Load donors once for lookup efficiency
    api.donors.getAll().then(setAllDonors).catch(console.error);
  }, [activeTab, viewMode, isMzeeWaKanisa, isAccountant]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'regular') {
        const data = await api.offerings.getAll();
        setRegularOfferings(data);
      } else {
        const data = await api.envelopeOfferings.getAll();
        setEnvOfferings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
      // Permission Check based on Active Tab
      if (activeTab === 'regular' && !canManageRegular) return;
      if (activeTab === 'envelope' && !canManageEnvelope) return;

      setErrorMsg(null);
      setSuccessMsg(null);
      setMatchedDonor(null);
      if (item) {
          setEditId(item.id);
          if (activeTab === 'regular') {
              setRegularForm({
                  service_date: item.service_date,
                  service_type: item.service_type,
                  amount: item.amount
              });
              setDisplayAmount(item.amount.toLocaleString());
          } else {
              setEnvForm({
                  offering_date: item.offering_date,
                  envelope_number: item.envelope_number,
                  amount: item.amount,
                  bahasha_type: item.bahasha_type || 'Ahadi'
              });
              setDisplayAmount(item.amount.toLocaleString());
              // Set matched donor for edit mode
              const donor = allDonors.find(d => d.envelope_number === item.envelope_number);
              setMatchedDonor(donor || null);
          }
      } else {
          resetForm();
      }
      setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setRegularForm(prev => ({
        service_date: prev.service_date || new Date().toISOString().split('T')[0],
        service_type: prev.service_type || ServiceType.FIRST,
        amount: 0
    }));
    setEnvForm(prev => ({
        offering_date: prev.offering_date || new Date().toISOString().split('T')[0],
        envelope_number: '', // Reset number
        amount: 0,
        bahasha_type: 'Ahadi'
    }));
    setDisplayAmount('');
    setMatchedDonor(null);
  };

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageRegular) return;

    try {
      if (editId) {
          await api.offerings.update(editId, regularForm);
          setIsModalOpen(false);
          if (viewMode === 'list') loadData();
      } else {
          await api.offerings.create(regularForm);
          // Keep modal open, reset amount only
          setRegularForm(prev => ({ ...prev, amount: 0 }));
          setDisplayAmount('');
          setSuccessMsg('Sadaka imerekodiwa!');
          setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (e) {
      alert("Hitilafu katika kuhifadhi sadaka.");
    }
  };

  const handleEnvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageEnvelope) return;
    setErrorMsg(null);
    try {
      if (editId) {
          await api.envelopeOfferings.update(editId, envForm);
          setIsModalOpen(false);
          if (viewMode === 'list') loadData();
      } else {
          await api.envelopeOfferings.create(envForm);
          // Keep modal open, reset envelope and amount
          setEnvForm(prev => ({ ...prev, envelope_number: '', amount: 0 }));
          setDisplayAmount('');
          setMatchedDonor(null);
          setSuccessMsg('Bahasha imerekodiwa!');
          setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Imeshindikana kuhifadhi. Hakikisha namba ya bahasha ipo.");
    }
  };

  const handleEnvelopeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEnvForm({ ...envForm, envelope_number: val });
      
      // Real-time lookup
      const donor = allDonors.find(d => d.envelope_number === val);
      setMatchedDonor(donor || null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'regular' | 'envelope') => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    if (rawValue === '') {
        setDisplayAmount('');
        if (type === 'regular') setRegularForm({...regularForm, amount: 0});
        else setEnvForm({...envForm, amount: 0});
        return;
    }
    const numberValue = parseFloat(rawValue);
    if (!isNaN(numberValue)) {
        if (type === 'regular') setRegularForm({...regularForm, amount: numberValue});
        else setEnvForm({...envForm, amount: numberValue});

        const parts = rawValue.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        setDisplayAmount(parts.join('.'));
    } else {
        setDisplayAmount(rawValue);
    }
  };

  const confirmDelete = (id: string, type: 'regular' | 'envelope') => {
    if (type === 'regular' && !canManageRegular) return;
    if (type === 'envelope' && !canManageEnvelope) return;

    setDeleteData({ id, type });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
        if (deleteData.type === 'regular') await api.offerings.delete(deleteData.id);
        else await api.envelopeOfferings.delete(deleteData.id);
        setShowDeleteModal(false);
        setDeleteData(null);
        loadData();
    } catch (e) {
        alert("Imeshindikana kufuta.");
    }
  };

  const filterDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const afterStart = startDate ? date >= new Date(startDate) : true;
      const beforeEnd = endDate ? date <= new Date(endDate) : true;
      return afterStart && beforeEnd;
  };

  const filteredRegular = regularOfferings.filter(r => filterDate(r.service_date));
  const filteredEnv = envOfferings.filter(e => filterDate(e.offering_date));


  // --- RENDER FORM CONTENT ---
  const renderRegularForm = () => (
    <form onSubmit={handleRegularSubmit} className="space-y-4">
        {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{successMsg}</span>
            </div>
        )}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tarehe</label>
            <input type="date" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={regularForm.service_date} onChange={e => setRegularForm({...regularForm, service_date: e.target.value})} />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aina ya Ibada</label>
            <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white" value={regularForm.service_type} onChange={e => setRegularForm({...regularForm, service_type: e.target.value as ServiceType})}>
            {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kiasi (TZS)</label>
            <input type="text" required inputMode="numeric" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold text-lg" value={displayAmount} onChange={e => handleAmountChange(e, 'regular')} />
        </div>
        <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold mt-4 flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" />
            Hifadhi
        </button>
    </form>
  );

  const renderEnvForm = () => (
    <form onSubmit={handleEnvSubmit} className="space-y-4">
        {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{successMsg}</span>
            </div>
        )}
        {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tarehe</label>
            <input type="date" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={envForm.offering_date} onChange={e => setEnvForm({...envForm, offering_date: e.target.value})} />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aina ya Bahasha</label>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => setEnvForm({...envForm, bahasha_type: 'Ahadi'})}
                    className={`py-3 rounded-xl border font-semibold text-sm transition-all ${envForm.bahasha_type === 'Ahadi' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    Ahadi
                </button>
                <button
                    type="button"
                    onClick={() => setEnvForm({...envForm, bahasha_type: 'Jengo'})}
                    className={`py-3 rounded-xl border font-semibold text-sm transition-all ${envForm.bahasha_type === 'Jengo' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    Jengo
                </button>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Namba ya Bahasha</label>
            <input 
            type="text" required placeholder="Mfano: 101" 
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
            value={envForm.envelope_number} 
            onChange={handleEnvelopeNumberChange} 
            />
            
            {/* Donor Lookup Result Card */}
            {matchedDonor && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center animate-in fade-in slide-in-from-top-1">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-indigo-900 truncate">{matchedDonor.donor_name}</p>
                        <p className="text-xs text-indigo-600 truncate">{matchedDonor.fellowship_name || 'Hana Jumuiya'}</p>
                    </div>
                </div>
            )}
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kiasi (TZS)</label>
            <input type="text" required inputMode="numeric" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold text-lg" value={displayAmount} onChange={e => handleAmountChange(e, 'envelope')} />
        </div>
        <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold mt-4 flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" />
            Hifadhi
        </button>
    </form>
  );

  // --- VIEW MODE: ADD (Desktop) ---
  if (viewMode === 'add') {
    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Rekodi Sadaka</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                {/* Internal Tabs for the Form */}
                {/* HIDDEN for Mzee Wa Kanisa AND Accountant */}
                {!isMzeeWaKanisa && !isAccountant && (
                    <div className="flex space-x-2 bg-slate-50 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab('regular')}
                            disabled={!canManageRegular}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'regular' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            Ibada ya Kawaida
                        </button>
                        <button
                            onClick={() => setActiveTab('envelope')}
                            disabled={!canManageEnvelope}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'envelope' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            Sadaka ya Bahasha
                        </button>
                    </div>
                )}

                {activeTab === 'regular' && canManageRegular && renderRegularForm()}
                {activeTab === 'envelope' && canManageEnvelope && renderEnvForm()}
                
                {/* Fallback permission message */}
                {((activeTab === 'regular' && !canManageRegular) || (activeTab === 'envelope' && !canManageEnvelope)) && (
                     <div className="text-center py-10 text-slate-400">
                         <Lock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                         <p>Hauna ruhusa ya kurekodi taarifa hii.</p>
                     </div>
                )}
            </div>
        </div>
    );
  }

  // --- VIEW MODE: LIST (Default) ---
  return (
    <div className="space-y-4 lg:space-y-6 pb-20">
      
      {/* Header & Mobile Toggle */}
      <div className="flex flex-col gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Sadaka</h1>
          
          {/* Tab Switcher - HIDDEN for Mzee Wa Kanisa AND Accountant */}
          {!isMzeeWaKanisa && !isAccountant && (
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-fit self-start">
                <button onClick={() => setActiveTab('regular')} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'regular' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ibada</button>
                <button onClick={() => setActiveTab('envelope')} className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'envelope' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bahasha</button>
              </div>
          )}
      </div>

      {/* Date Filters (Collapsible on Mobile) */}
      <div className="bg-white p-3 lg:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
         <div className="flex justify-between items-center lg:hidden" onClick={() => setShowFilters(!showFilters)}>
             <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Filter className="w-4 h-4" /> Chuja Tarehe</span>
             <span className="text-xs text-indigo-600">{startDate || endDate ? 'Imewashwa' : ''}</span>
         </div>

         <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col sm:flex-row gap-2 animate-in slide-in-from-top-2 duration-200`}>
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1">
                <span className="text-xs text-slate-500 w-12">Kuanzia:</span>
                <input type="date" className="bg-transparent text-sm outline-none w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
             </div>
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1">
                <span className="text-xs text-slate-500 w-12">Hadi:</span>
                <input type="date" className="bg-transparent text-sm outline-none w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
             </div>
             {(startDate || endDate) && (
                 <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-2 text-rose-500 text-sm font-medium self-end sm:self-center">
                     Futa
                 </button>
             )}
         </div>
      </div>

      {/* Lists (Card View for Mobile, Table for Desktop) */}
      <div className="bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-slate-200 bg-transparent">
          {activeTab === 'regular' ? (
              <>
                <div className="lg:hidden space-y-3">
                    {loading ? <div className="p-4"><LoadingCross /></div> : filteredRegular.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">{item.service_type}</span>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" /> {new Date(item.service_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-slate-900">{item.amount.toLocaleString()}</div>
                                {canManageRegular && (
                                    <div className="flex justify-end gap-3 mt-1.5">
                                        <button onClick={() => handleOpenModal(item)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => confirmDelete(item.id, 'regular')} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900">
                            <tr>
                                <th className="px-6 py-4">Tarehe</th>
                                <th className="px-6 py-4">Aina</th>
                                <th className="px-6 py-4 text-right">Kiasi</th>
                                {canManageRegular && <th className="px-6 py-4 text-center">Matendo</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                              <tr><td colSpan={canManageRegular ? 4 : 3} className="px-6 py-8 text-center"><LoadingCross /></td></tr>
                            ) : (
                                filteredRegular.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(item.service_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{item.service_type}</span></td>
                                    <td className="px-6 py-4 text-right font-mono">{item.amount.toLocaleString()}</td>
                                    {canManageRegular && (
                                        <td className="px-6 py-4 flex justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => confirmDelete(item.id, 'regular')} className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    )}
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </>
          ) : (
              <>
                 <div className="lg:hidden space-y-3">
                    {loading ? <div className="p-4"><LoadingCross /></div> : filteredEnv.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800">#{item.envelope_number}</span>
                                    {item.bahasha_type === 'Jengo' ? (
                                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Jengo</span>
                                    ) : (
                                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">Ahadi</span>
                                    )}
                                </div>
                                <div className="text-sm text-slate-600 mb-1">{item.donor_name}</div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" /> {new Date(item.offering_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-slate-900">{item.amount.toLocaleString()}</div>
                                {canManageEnvelope && (
                                    <div className="flex justify-end gap-3 mt-1.5">
                                        <button onClick={() => handleOpenModal(item)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => confirmDelete(item.id, 'envelope')} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900">
                            <tr>
                                <th className="px-6 py-4">Tarehe</th>
                                <th className="px-6 py-4">Bahasha</th>
                                <th className="px-6 py-4">Aina</th>
                                <th className="px-6 py-4">Jina</th>
                                <th className="px-6 py-4 text-right">Kiasi</th>
                                {canManageEnvelope && <th className="px-6 py-4 text-center">Matendo</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                              <tr><td colSpan={canManageEnvelope ? 6 : 5} className="px-6 py-8 text-center"><LoadingCross /></td></tr>
                            ) : (
                                filteredEnv.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(item.offering_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold">#{item.envelope_number}</td>
                                    <td className="px-6 py-4">
                                        {item.bahasha_type === 'Jengo' ? (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Jengo</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Ahadi</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{item.donor_name}</td>
                                    <td className="px-6 py-4 text-right font-mono">{item.amount.toLocaleString()}</td>
                                    {canManageEnvelope && (
                                        <td className="px-6 py-4 flex justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => confirmDelete(item.id, 'envelope')} className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    )}
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>
              </>
          )}
      </div>

      {/* FAB (Mobile Only) - Condition based on Tab */}
      {((activeTab === 'regular' && canManageRegular) || (activeTab === 'envelope' && canManageEnvelope)) && (
          <button onClick={() => handleOpenModal()} className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
              <Plus className="w-8 h-8" />
          </button>
      )}

      {/* Modal Form (Mobile Add, Desktop Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">
                        {activeTab === 'regular' ? (editId ? 'Hariri Ibada' : 'Rekodi Ibada') : (editId ? 'Hariri Bahasha' : 'Rekodi Bahasha')}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6">
                    {activeTab === 'regular' ? renderRegularForm() : renderEnvForm()}
                </div>
            </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600"><AlertTriangle className="w-6 h-6" /></div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Futa Rekodi?</h3>
                    <p className="text-sm text-slate-500 mb-6">Kitendo hiki hakiwezi kurudishwa.</p>
                    <div className="flex w-full space-x-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">Ghairi</button>
                        <button onClick={handleDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium">Futa</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Offerings;