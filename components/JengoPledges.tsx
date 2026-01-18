import React, { useState, useEffect } from 'react';
import { api } from '../services/supabaseService';
import { JengoPledge, Fellowship, EnvelopeOffering } from '../types';
import { Search, Edit2, Save, X, Coins, Eye, Calendar, FileText } from 'lucide-react';
import LoadingCross from './LoadingCross';

const JengoPledges: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pledges, setPledges] = useState<JengoPledge[]>([]);
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFellowship, setSelectedFellowship] = useState<string>('all');
  
  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPledge, setEditingPledge] = useState<JengoPledge | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryPledge, setSelectedHistoryPledge] = useState<JengoPledge | null>(null);
  const [historyData, setHistoryData] = useState<EnvelopeOffering[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [pledgesData, fellowshipsData] = await Promise.all([
            api.jengo.getAllPledges(),
            api.fellowships.getAll()
        ]);
        setPledges(pledgesData);
        setFellowships(fellowshipsData);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (pledge: JengoPledge) => {
      setEditingPledge(pledge);
      setPledgeAmount(pledge.amount.toString());
      setIsEditModalOpen(true);
  };

  const handleViewHistory = async (pledge: JengoPledge) => {
      setSelectedHistoryPledge(pledge);
      setIsHistoryModalOpen(true);
      setLoadingHistory(true);
      try {
          const data = await api.jengo.getDonorHistory(pledge.envelope_number);
          setHistoryData(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingHistory(false);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPledge) return;
      
      setSaving(true);
      try {
          await api.jengo.upsertPledge(editingPledge.envelope_number, parseFloat(pledgeAmount));
          await loadData(); // Reload to recalculate
          setIsEditModalOpen(false);
      } catch (e) {
          alert('Hitilafu wakati wa kuhifadhi ahadi.');
      } finally {
          setSaving(false);
      }
  };

  // Calculations
  const filteredData = pledges.filter(p => {
      const matchSearch = p.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.envelope_number.includes(searchTerm);
      const matchFellowship = selectedFellowship === 'all' || p.fellowship_name === fellowships.find(f => f.id === selectedFellowship)?.name;
      return matchSearch && matchFellowship;
  });

  const totalPledged = filteredData.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = filteredData.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const percentComplete = totalPledged > 0 ? (totalPaid / totalPledged) * 100 : 0;

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingCross /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Michango ya Jengo</h1>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-xs uppercase font-bold text-slate-500 mb-1">Jumla ya Ahadi</p>
                  <p className="text-2xl font-mono font-bold text-slate-900">{totalPledged.toLocaleString()} TZS</p>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-10">
                  <Coins className="w-20 h-20 text-slate-600" />
              </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
               <div>
                  <p className="text-xs uppercase font-bold text-emerald-600 mb-1">Imekusanywa</p>
                  <p className="text-2xl font-mono font-bold text-emerald-600">+{totalPaid.toLocaleString()} TZS</p>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                   <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(percentComplete, 100)}%` }}></div>
               </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs uppercase font-bold text-orange-600 mb-1">Inadaiwa</p>
              <p className="text-2xl font-mono font-bold text-orange-600">{(totalPledged - totalPaid).toLocaleString()} TZS</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Asilimia: {percentComplete.toFixed(1)}%</p>
          </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Tafuta jina au namba..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
          </div>
          <select 
             className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
             value={selectedFellowship}
             onChange={e => setSelectedFellowship(e.target.value)}
          >
              <option value="all">Jumuiya Zote</option>
              {fellowships.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">Mhumini</th>
                          <th className="px-6 py-4">Jumuiya</th>
                          <th className="px-6 py-4 text-right">Ahadi (TZS)</th>
                          <th className="px-6 py-4 text-right">Imelipwa (TZS)</th>
                          <th className="px-6 py-4 text-right">Baki (TZS)</th>
                          <th className="px-6 py-4 text-center">Hali</th>
                          <th className="px-6 py-4 text-center">Hatua</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {filteredData.map((row) => {
                          const progress = row.amount > 0 ? (row.paid_amount || 0) / row.amount : 0;
                          const isComplete = progress >= 1;
                          
                          return (
                            <tr key={row.envelope_number} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{row.donor_name}</div>
                                    <div className="text-xs text-slate-500 font-mono">#{row.envelope_number}</div>
                                </td>
                                <td className="px-6 py-4">{row.fellowship_name}</td>
                                <td className="px-6 py-4 text-right font-medium">{row.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-medium text-emerald-600">{row.paid_amount?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-orange-600">{(row.remaining_amount || 0).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    {isComplete ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                            Imekamilika
                                        </span>
                                    ) : (
                                        <div className="w-24 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
                                            <div className="h-full bg-orange-400" style={{ width: `${Math.min(progress * 100, 100)}%` }}></div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(row)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                        title="Badili Ahadi"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleViewHistory(row)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                                        title="Ona Historia ya Michango"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Edit Pledge Modal */}
      {isEditModalOpen && editingPledge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-900">Weka Ahadi ya Jengo</h3>
                      <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6">
                      <div className="mb-4">
                          <p className="text-sm text-slate-500 mb-1">Mhumini:</p>
                          <p className="font-bold text-slate-900 text-lg">{editingPledge.donor_name} <span className="text-slate-400 text-sm font-normal">#{editingPledge.envelope_number}</span></p>
                      </div>
                      <div className="mb-6">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Kiasi cha Ahadi (TZS)</label>
                          <input 
                              type="number" 
                              required
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-lg font-bold"
                              value={pledgeAmount}
                              onChange={e => setPledgeAmount(e.target.value)}
                          />
                      </div>
                      <button 
                          type="submit" 
                          disabled={saving}
                          className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center"
                      >
                          {saving ? <LoadingCross /> : <><Save className="w-4 h-4 mr-2" /> Hifadhi Ahadi</>}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedHistoryPledge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Historia ya Michango
                      </h3>
                      <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-6 border-b border-slate-100">
                      <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg text-slate-900">{selectedHistoryPledge.donor_name}</p>
                            <p className="text-sm text-slate-500 font-mono">#{selectedHistoryPledge.envelope_number} • {selectedHistoryPledge.fellowship_name}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs uppercase text-slate-400 font-bold">Imelipwa Jumla</p>
                             <p className="text-xl font-mono font-bold text-emerald-600">{(selectedHistoryPledge.paid_amount || 0).toLocaleString()} TZS</p>
                          </div>
                      </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                      {loadingHistory ? (
                          <div className="p-8"><LoadingCross /></div>
                      ) : historyData.length === 0 ? (
                          <div className="p-10 text-center text-slate-500">
                              Hakuna michango ya jengo iliyorekodiwa bado.
                          </div>
                      ) : (
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs sticky top-0">
                                  <tr>
                                      <th className="px-6 py-3 border-b">Tarehe</th>
                                      <th className="px-6 py-3 border-b text-right">Kiasi (TZS)</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {historyData.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                          <td className="px-6 py-3 flex items-center gap-2">
                                              <Calendar className="w-3 h-3 text-slate-400" />
                                              {new Date(item.offering_date).toLocaleDateString()}
                                          </td>
                                          <td className="px-6 py-3 text-right font-mono font-medium">
                                              {item.amount.toLocaleString()}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default JengoPledges;
