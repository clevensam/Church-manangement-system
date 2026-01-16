import React, { useState, useEffect } from 'react';
import { api } from '../services/supabaseService';
import { Donor, Fellowship } from '../types';
import { UserPlus, Search, X, Users, Save, CheckCircle2 } from 'lucide-react';
import LoadingCross from './LoadingCross';

interface DonorsProps {
    viewMode?: 'list' | 'add';
}

const Donors: React.FC<DonorsProps> = ({ viewMode = 'list' }) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Donor>({
    envelope_number: '',
    donor_name: '',
    fellowship_id: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Always load fellowships for the dropdown
    loadFellowships();
    
    if (viewMode === 'list') {
        loadDonors();
    } else {
        resetForm();
    }
  }, [viewMode]);

  const loadFellowships = async () => {
      try {
          const data = await api.fellowships.getAll();
          setFellowships(data);
      } catch (err) {
          console.error("Failed to load fellowships", err);
      }
  };

  const loadDonors = async () => {
    setLoading(true);
    const data = await api.donors.getAll();
    setDonors(data);
    setLoading(false);
  };

  const resetForm = () => {
      setForm({ envelope_number: '', donor_name: '', fellowship_id: '' });
      setError(null);
      setSuccessMsg(null);
  };

  const handleOpenModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if(!form.fellowship_id) {
        setError("Tafadhali chagua Jumuiya.");
        return;
    }

    try {
      await api.donors.create(form);
      // Reset form but keep feedback
      setForm({ envelope_number: '', donor_name: '', fellowship_id: '' });
      setIsModalOpen(false); // Close mobile modal if open
      
      setSuccessMsg('Mhumini amesajiliwa kikamilifu!');
      setTimeout(() => setSuccessMsg(null), 3000);

      if (viewMode === 'list') loadDonors();
    } catch (e: any) {
      setError(e.message || "Imeshindikana kusajili mhumini.");
    }
  };

  const filteredDonors = donors.filter(d => 
    d.donor_name.toLowerCase().includes(search.toLowerCase()) || 
    d.envelope_number.includes(search)
  );

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">{error}</div>}
        {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{successMsg}</span>
            </div>
        )}
        
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Namba ya Bahasha</label>
            <input 
                type="text" required placeholder="Mfano: 105"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={form.envelope_number}
                onChange={e => setForm({...form, envelope_number: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jina Kamili</label>
            <input 
                type="text" required placeholder="Jina la Mhumini"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={form.donor_name}
                onChange={e => setForm({...form, donor_name: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumuiya</label>
            <select 
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={form.fellowship_id}
                onChange={e => setForm({...form, fellowship_id: e.target.value})}
            >
                <option value="">Chagua Jumuiya</option>
                {fellowships.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>
        </div>
        
        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold mt-4 hover:bg-blue-700 flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" />
            Sajili
        </button>
    </form>
  );

  // --- VIEW MODE: ADD (Desktop) ---
  if (viewMode === 'add') {
    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Sajili Mhumini</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6 pb-6 border-b border-slate-100">
                    <p className="text-slate-500">Jaza fomu hii kusajili mhumini mpya na kumpa namba ya bahasha.</p>
                </div>
                {renderFormContent()}
            </div>
        </div>
    );
  }

  // --- VIEW MODE: LIST (Default) ---
  return (
    <div className="space-y-4 lg:space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Wahumini</h1>
        <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            Jumla: {donors.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
                type="text"
                placeholder="Tafuta jina au namba..."
                className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-slate-700"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {loading ? (
            <div className="col-span-full py-10">
                <LoadingCross />
            </div>
        ) : filteredDonors.length === 0 ? (
            <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                Hakuna wahumini waliopatikana.
            </div>
        ) : (
            filteredDonors.map((donor) => (
                <div key={donor.envelope_number} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                        {donor.envelope_number}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{donor.donor_name}</h3>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                            <Users className="w-3 h-3" /> {donor.fellowship_name}
                        </p>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* FAB (Mobile Only) */}
      <button 
        onClick={handleOpenModal}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
          <UserPlus className="w-7 h-7" />
      </button>

      {/* Modal Form (Mobile Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">Sajili Mhumini Mpya</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    {renderFormContent()}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Donors;