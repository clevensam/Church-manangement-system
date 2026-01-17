import React, { useState, useEffect } from 'react';
import { api } from '../services/supabaseService';
import { Expense } from '../types';
import { Plus, Trash2, Edit2, Calendar, Save, X, Search, AlertTriangle, Filter, CheckCircle2, Lock } from 'lucide-react';
import LoadingCross from './LoadingCross';
import { useAuth } from '../contexts/AuthContext';

interface ExpensesProps {
    viewMode?: 'list' | 'add';
}

const Expenses: React.FC<ExpensesProps> = ({ viewMode = 'list' }) => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Permissions
  const canManage = profile?.role === 'accountant' || profile?.role === 'admin';

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Toggle for mobile

  // Form & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0]
  });
  const [displayAmount, setDisplayAmount] = useState('');
  
  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    if (viewMode === 'list') {
        loadExpenses();
    } else {
        resetForm(); // Ensure fresh form on add mode
    }
  }, [viewMode]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.expenses.getAll();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Called by FAB or Edit Button
  const handleOpenModal = (item?: Expense) => {
      if (!canManage) return; // Prevent open if no permission

      setSuccessMsg(null);
      if (item) {
          setEditId(item.id);
          setFormData(item);
          setDisplayAmount(item.amount.toLocaleString());
      } else {
          resetForm();
      }
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      resetForm();
      setSuccessMsg(null);
  };

  const resetForm = () => {
    setEditId(null);
    setFormData(prev => ({
      description: '',
      amount: 0,
      expense_date: prev.expense_date || new Date().toISOString().split('T')[0] // Keep date for batch entry
    }));
    setDisplayAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    if (!formData.description || !formData.amount || !formData.expense_date) return;

    try {
      if (editId) {
        await api.expenses.update(editId, formData);
        handleCloseModal(); // Close if editing (Mobile modal or Desktop list edit)
        if (viewMode === 'list') loadExpenses(); 
      } else {
        await api.expenses.create(formData as Omit<Expense, 'id'>);
        // Do NOT close, just reset fields
        setFormData(prev => ({ ...prev, description: '', amount: 0 }));
        setDisplayAmount('');
        // Show success feedback
        setSuccessMsg('Matumizi yamehifadhiwa kikamilifu!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert("Imeshindikana kuhifadhi matumizi.");
    }
  };

  const confirmDelete = (expense: Expense) => {
    if (!canManage) return;
    setItemToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (itemToDelete && canManage) {
      await api.expenses.delete(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
      loadExpenses();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    if (rawValue === '') {
        setDisplayAmount('');
        setFormData({...formData, amount: 0});
        return;
    }
    const numberValue = parseFloat(rawValue);
    if (!isNaN(numberValue)) {
        setFormData({...formData, amount: numberValue});
        const parts = rawValue.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        setDisplayAmount(parts.join('.'));
    } else {
        setDisplayAmount(rawValue);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const date = new Date(expense.expense_date);
    const afterStart = startDate ? date >= new Date(startDate) : true;
    const beforeEnd = endDate ? date <= new Date(endDate) : true;
    return matchesSearch && afterStart && beforeEnd;
  });

  // --- RENDER FORM CONTENT (Reused for Modal and Desktop Inline) ---
  const renderFormContent = () => (
      <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message Toast */}
            {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{successMsg}</span>
            </div>
        )}

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tarehe</label>
            <input 
                type="date" required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-base"
                value={formData.expense_date}
                onChange={e => setFormData({...formData, expense_date: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Maelezo</label>
            <input 
                type="text" required placeholder="Mfano: Luku"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-base"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kiasi (TZS)</label>
            <input 
                type="text" required placeholder="0" inputMode="numeric"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-lg font-mono font-bold text-slate-800"
                value={displayAmount}
                onChange={handleAmountChange}
            />
        </div>
        <button 
            type="submit"
            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 shadow-md mt-4 flex items-center justify-center"
        >
            <Save className="w-5 h-5 mr-2" />
            {editId ? 'Hifadhi Mabadiliko' : 'Hifadhi Matumizi'}
        </button>
      </form>
  );


  // --- VIEW MODE: ADD (Desktop) ---
  if (viewMode === 'add') {
      if (!canManage) {
          return <div className="p-8 text-center text-rose-500">Hauna ruhusa ya kurekodi matumizi.</div>;
      }
      return (
          <div className="max-w-2xl mx-auto py-6">
              <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Rekodi Matumizi</h1>
                  <a href="#" onClick={(e) => { e.preventDefault(); }} className="hidden">Rejea Orodha</a>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="mb-6 pb-6 border-b border-slate-100">
                     <p className="text-slate-500">Jaza fomu hapa chini kurekodi matumizi mapya. Unaweza kuhifadhi na kuendelea kujaza nyingine.</p>
                  </div>
                  {renderFormContent()}
              </div>
          </div>
      );
  }

  // --- VIEW MODE: LIST (Desktop & Mobile Default) ---
  return (
    <div className="space-y-4 lg:space-y-6 pb-20">
      <div className="flex justify-between items-center">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Matumizi</h1>
      </div>

      {/* Mobile: Filter Toggle & Search */}
      <div className="bg-white p-3 lg:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
         <div className="flex gap-2">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Tafuta maelezo..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border ${showFilters ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
             >
                 <Filter className="w-5 h-5" />
             </button>
         </div>

         {/* Collapsible Filters */}
         {showFilters && (
             <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
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
         )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-slate-200 lg:overflow-hidden bg-transparent">
          
          {/* Mobile: Card View */}
          <div className="lg:hidden space-y-3">
             {loading ? <LoadingCross /> : filteredExpenses.length === 0 ? <div className="text-center p-8 text-slate-400">Hakuna matumizi.</div> : (
                 filteredExpenses.map((item) => (
                     <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                         <div>
                             <p className="font-semibold text-slate-800">{item.description}</p>
                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                 <Calendar className="w-3 h-3" />
                                 {new Date(item.expense_date).toLocaleDateString()}
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="font-mono font-bold text-rose-600">-{item.amount.toLocaleString()}</p>
                             {canManage && (
                                <div className="flex justify-end gap-3 mt-2">
                                    <button onClick={() => handleOpenModal(item)} className="text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => confirmDelete(item)} className="text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             )}
                         </div>
                     </div>
                 ))
             )}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-900">
                <tr>
                  <th className="px-6 py-4">Tarehe</th>
                  <th className="px-6 py-4">Maelezo</th>
                  <th className="px-6 py-4 text-right">Kiasi (TZS)</th>
                  {canManage && <th className="px-6 py-4 text-center">Matendo</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={canManage ? 4 : 3} className="px-6 py-8 text-center"><LoadingCross /></td></tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr><td colSpan={canManage ? 4 : 3} className="px-6 py-8 text-center text-slate-400">Hakuna matumizi yaliyopatikana.</td></tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{expense.description}</td>
                      <td className="px-6 py-4 text-right font-mono text-rose-600 font-medium">-{expense.amount.toLocaleString()}</td>
                      {canManage && (
                          <td className="px-6 py-4 flex justify-center space-x-2">
                            <button onClick={() => handleOpenModal(expense)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50" title="Hariri">
                            <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => confirmDelete(expense)} className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50" title="Futa">
                            <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile Only - Permission Check */}
      {canManage && (
          <button 
            onClick={() => handleOpenModal()}
            className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
          >
              <Plus className="w-8 h-8" />
          </button>
      )}

      {/* Add/Edit Modal (Used for Mobile Add, and Desktop Edit) */}
      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900">
                        {editId ? 'Hariri Matumizi' : 'Rekodi Matumizi'}
                    </h2>
                    <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    {renderFormContent()}
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Futa Matumizi?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Je, una uhakika unataka kufuta <strong>{itemToDelete?.description}</strong>?
                    </p>
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

export default Expenses;