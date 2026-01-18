import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Fellowship, EnvelopeOffering, RegularOffering, Expense, ServiceType } from '../types';
import { FileText, Download, Filter, Printer, Banknote, Calendar, Layers, Search } from 'lucide-react';
import LoadingCross from './LoadingCross';

type ReportType = 'envelope' | 'regular' | 'expense';

const Reports: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // State for selections
  const [selectedReport, setSelectedReport] = useState<ReportType>('envelope');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filters
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [selectedFellowship, setSelectedFellowship] = useState<string>('all');
  const [selectedBahashaType, setSelectedBahashaType] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  
  // Data
  const [reportData, setReportData] = useState<any[]>([]);
  const [generated, setGenerated] = useState(false);

  // Initialize Role based defaults
  useEffect(() => {
    if (!profile) return;
    
    // Default tabs based on role
    if (profile.role === 'jumuiya_leader') setSelectedReport('envelope');
    else if (profile.role === 'accountant') setSelectedReport('regular');
    
    // Load Fellowships for filters
    const loadFellowships = async () => {
        try {
            const data = await api.fellowships.getAll();
            setFellowships(data);
        } catch (e) {
            console.error(e);
        }
    };
    loadFellowships();
  }, [profile]);

  // Determine Available Reports
  const availableReports: {id: ReportType, label: string}[] = [];
  if (['admin', 'pastor', 'jumuiya_leader'].includes(profile?.role || '')) {
      availableReports.push({ id: 'envelope', label: 'Sadaka za Bahasha' });
  }
  if (['admin', 'pastor', 'accountant'].includes(profile?.role || '')) {
      availableReports.push({ id: 'regular', label: 'Sadaka za Ibada' });
      availableReports.push({ id: 'expense', label: 'Matumizi' });
  }

  const handleGenerate = async () => {
      setLoading(true);
      setGenerated(false);
      setReportData([]);

      try {
          let data: any[] = [];
          
          if (selectedReport === 'envelope') {
              const res = await api.envelopeOfferings.getAll();
              data = res.filter(item => {
                  const date = new Date(item.offering_date);
                  const start = startDate ? new Date(startDate) : new Date(0);
                  const end = endDate ? new Date(endDate) : new Date(2100, 0, 1);
                  
                  const dateMatch = date >= start && date <= end;
                  const fellowshipMatch = selectedFellowship === 'all' || item.fellowship_name === fellowships.find(f => f.id === selectedFellowship)?.name;
                  const typeMatch = selectedBahashaType === 'all' || item.bahasha_type === selectedBahashaType;
                  
                  return dateMatch && fellowshipMatch && typeMatch;
              });
          } else if (selectedReport === 'regular') {
              const res = await api.offerings.getAll();
              data = res.filter(item => {
                  const date = new Date(item.service_date);
                  const start = startDate ? new Date(startDate) : new Date(0);
                  const end = endDate ? new Date(endDate) : new Date(2100, 0, 1);
                  
                  const dateMatch = date >= start && date <= end;
                  const typeMatch = selectedServiceType === 'all' || item.service_type === selectedServiceType;
                  return dateMatch && typeMatch;
              });
          } else if (selectedReport === 'expense') {
              const res = await api.expenses.getAll();
              data = res.filter(item => {
                  const date = new Date(item.expense_date);
                  const start = startDate ? new Date(startDate) : new Date(0);
                  const end = endDate ? new Date(endDate) : new Date(2100, 0, 1);
                  return date >= start && date <= end;
              });
          }

          setReportData(data);
          setGenerated(true);
      } catch (e) {
          console.error(e);
          alert('Hitilafu wakati wa kutengeneza ripoti');
      } finally {
          setLoading(false);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const calculateTotal = () => reportData.reduce((sum, item) => sum + (item.amount || 0), 0);

  // --- RENDER HELPERS ---
  
  const renderControls = () => (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:hidden">
          {/* 1. Report Type Tabs */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
              {availableReports.map(rep => (
                  <button
                    key={rep.id}
                    onClick={() => { setSelectedReport(rep.id); setGenerated(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedReport === rep.id 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                      {rep.label}
                  </button>
              ))}
          </div>

          {/* 2. Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tarehe ya Kuanza</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tarehe ya Mwisho</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>

              {/* Dynamic Filters based on Report Type */}
              {selectedReport === 'envelope' && (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Jumuiya</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={selectedFellowship} onChange={e => setSelectedFellowship(e.target.value)}>
                            <option value="all">Zote</option>
                            {fellowships.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Aina ya Bahasha</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={selectedBahashaType} onChange={e => setSelectedBahashaType(e.target.value)}>
                            <option value="all">Zote</option>
                            <option value="Ahadi">Ahadi</option>
                            <option value="Jengo">Jengo</option>
                        </select>
                    </div>
                  </>
              )}

              {selectedReport === 'regular' && (
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Aina ya Ibada</label>
                      <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={selectedServiceType} onChange={e => setSelectedServiceType(e.target.value)}>
                          <option value="all">Zote</option>
                          {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                  </div>
              )}
          </div>

          {/* 3. Action Buttons */}
          <div className="pt-2 flex justify-end gap-3">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center disabled:opacity-70"
              >
                  {loading ? <LoadingCross /> : <><FileText className="w-4 h-4 mr-2" /> Tengeneza Ripoti</>}
              </button>
          </div>
      </div>
  );

  const renderPrintHeader = () => (
      <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b-2 border-slate-900 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
                <Banknote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">KanisaLetu</h1>
          </div>
          <h2 className="text-xl font-bold uppercase text-slate-700 tracking-wider">
              {selectedReport === 'envelope' && 'Ripoti ya Sadaka za Bahasha'}
              {selectedReport === 'regular' && 'Ripoti ya Sadaka za Ibada'}
              {selectedReport === 'expense' && 'Ripoti ya Matumizi'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
              Imetolewa: {new Date().toLocaleDateString('sw-TZ', { dateStyle: 'full' })}
          </p>
          <div className="mt-2 text-xs font-mono text-slate-400">
             Kipindi: {startDate ? new Date(startDate).toLocaleDateString() : 'Mwanzo'} - {endDate ? new Date(endDate).toLocaleDateString() : 'Sasa'}
          </div>
      </div>
  );

  const renderTable = () => {
      if (!generated) return null;

      if (reportData.length === 0) {
          return (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 mt-6">
                  <p className="text-slate-500">Hakuna taarifa kulingana na vigezo vilivyochaguliwa.</p>
              </div>
          );
      }

      return (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6 print:mb-8">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 print:border-slate-300 print:bg-white">
                      <p className="text-xs uppercase text-emerald-800 font-bold mb-1 print:text-slate-600">Jumla Kuu</p>
                      <p className="text-2xl font-mono font-bold text-emerald-600 print:text-slate-900">{calculateTotal().toLocaleString()} TZS</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 print:border-slate-300 print:bg-white">
                      <p className="text-xs uppercase text-blue-800 font-bold mb-1 print:text-slate-600">Idadi ya Miamala</p>
                      <p className="text-2xl font-mono font-bold text-blue-600 print:text-slate-900">{reportData.length}</p>
                  </div>
              </div>

              {/* Action Bar (Download) */}
              <div className="flex justify-between items-center mb-4 print:hidden">
                  <h3 className="font-bold text-slate-700">Orodha ya Miamala</h3>
                  <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold text-sm transition-colors">
                      <Printer className="w-4 h-4 mr-2" /> Chapisha / PDF
                  </button>
              </div>

              {/* Data Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 print:border-black">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs print:bg-slate-200">
                          <tr>
                              <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Tarehe</th>
                              {selectedReport === 'envelope' && <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Namba</th>}
                              <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Maelezo / Jina</th>
                              {selectedReport === 'envelope' && <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Jumuiya</th>}
                              {selectedReport === 'envelope' && <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Aina</th>}
                              {selectedReport === 'regular' && <th className="px-4 py-3 border-b border-r border-slate-200 print:border-black">Aina ya Ibada</th>}
                              <th className="px-4 py-3 border-b border-slate-200 print:border-black text-right">Kiasi (TZS)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                          {reportData.map((item, idx) => (
                              <tr key={item.id || idx} className="hover:bg-slate-50 print:hover:bg-transparent">
                                  <td className="px-4 py-3 border-r border-slate-100 print:border-black">
                                      {new Date(item.offering_date || item.service_date || item.expense_date).toLocaleDateString()}
                                  </td>
                                  
                                  {selectedReport === 'envelope' && (
                                      <td className="px-4 py-3 font-mono font-bold border-r border-slate-100 print:border-black">
                                          #{item.envelope_number}
                                      </td>
                                  )}

                                  <td className="px-4 py-3 border-r border-slate-100 print:border-black">
                                      {item.description || item.donor_name || '-'}
                                  </td>

                                  {selectedReport === 'envelope' && (
                                      <td className="px-4 py-3 border-r border-slate-100 print:border-black text-xs uppercase">
                                          {item.fellowship_name}
                                      </td>
                                  )}
                                  
                                  {selectedReport === 'envelope' && (
                                      <td className="px-4 py-3 border-r border-slate-100 print:border-black">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase print:border print:border-black print:text-black ${item.bahasha_type === 'Jengo' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                              {item.bahasha_type}
                                          </span>
                                      </td>
                                  )}

                                  {selectedReport === 'regular' && (
                                      <td className="px-4 py-3 border-r border-slate-100 print:border-black">
                                          {item.service_type}
                                      </td>
                                  )}

                                  <td className="px-4 py-3 text-right font-mono font-medium print:border-black">
                                      {item.amount.toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200 print:bg-slate-100 print:border-black">
                          <tr>
                             <td colSpan={selectedReport === 'envelope' ? 5 : 2} className="px-4 py-3 text-right uppercase text-xs text-slate-500 print:text-black border-r border-slate-200 print:border-black">Jumla Kuu</td>
                             <td className="px-4 py-3 text-right font-mono text-slate-900 print:text-black">{calculateTotal().toLocaleString()}</td>
                          </tr>
                      </tfoot>
                  </table>
              </div>
              
              {/* Print Footer */}
              <div className="hidden print:block mt-8 text-center text-[10px] text-slate-400 border-t pt-4">
                  Ripoti hii imetolewa na Mfumo wa KanisaLetu.
              </div>
          </div>
      );
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Ripoti</h1>
      </div>

      {renderControls()}

      <div id="printable-area">
          {generated && (
              <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
                  {renderPrintHeader()}
                  {renderTable()}
              </div>
          )}
      </div>

      {/* CSS for Printing */}
      <style>{`
          @media print {
              @page { size: A4; margin: 20mm; }
              body { background: white; -webkit-print-color-adjust: exact; }
              #root > div > div > aside { display: none; } /* Hide Sidebar */
              header { display: none; } /* Hide Top Navbar */
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
              .print\\:flex { display: flex !important; }
              .print\\:bg-white { background-color: white !important; }
              .print\\:text-black { color: black !important; }
              .print\\:border-black { border-color: #000 !important; }
              /* Force table borders in print */
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; }
          }
      `}</style>
    </div>
  );
};

export default Reports;