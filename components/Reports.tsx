import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Fellowship, EnvelopeOffering, RegularOffering, Expense, ServiceType } from '../types';
import { FileText, Download, Filter, Printer, Banknote, Calendar, Layers, Search } from 'lucide-react';
import LoadingCross from './LoadingCross';

type ReportType = 'envelope' | 'regular' | 'expense' | 'jengo';

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
    if (profile.role === 'mzee_wa_kanisa') setSelectedReport('envelope');
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
  
  if (['admin', 'pastor', 'mzee_wa_kanisa'].includes(profile?.role || '')) {
      availableReports.push({ id: 'envelope', label: 'Sadaka za Bahasha' });
  }
  
  if (['admin', 'pastor', 'accountant'].includes(profile?.role || '')) {
      availableReports.push({ id: 'regular', label: 'Sadaka za Ibada' });
      availableReports.push({ id: 'expense', label: 'Matumizi' });
  }

  // Jengo Report: Admin, Pastor, Accountant Only
  if (['admin', 'pastor', 'accountant'].includes(profile?.role || '')) {
      availableReports.push({ id: 'jengo', label: 'Ahadi za Jengo' });
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
          } else if (selectedReport === 'jengo') {
              // For Jengo, we fetch the status of pledges
              const res = await api.jengo.getAllPledges();
              data = res.filter(item => {
                  // Jengo status is cumulative, usually doesn't filter by transaction date
                  // But we allow filtering by Fellowship
                  const fellowshipMatch = selectedFellowship === 'all' || item.fellowship_name === fellowships.find(f => f.id === selectedFellowship)?.name;
                  return fellowshipMatch;
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

  const calculateTotal = () => {
      // For Jengo report, we might want to sum the PAID amount
      if (selectedReport === 'jengo') {
          return reportData.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
      }
      return reportData.reduce((sum, item) => sum + (item.amount || 0), 0);
  };
  
  const calculateTotalPledged = () => {
      if (selectedReport === 'jengo') {
          return reportData.reduce((sum, item) => sum + (item.amount || 0), 0);
      }
      return 0;
  };

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
              {/* Date Range - Hide for Jengo Status as it is cumulative snapshot */}
              {selectedReport !== 'jengo' && (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tarehe ya Kuanza</label>
                        <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tarehe ya Mwisho</label>
                        <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </>
              )}

              {/* Dynamic Filters based on Report Type */}
              {(selectedReport === 'envelope' || selectedReport === 'jengo') && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Jumuiya</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={selectedFellowship} onChange={e => setSelectedFellowship(e.target.value)}>
                            <option value="all">Zote</option>
                            {fellowships.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
              )}
              
              {selectedReport === 'envelope' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Aina ya Bahasha</label>
                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" value={selectedBahashaType} onChange={e => setSelectedBahashaType(e.target.value)}>
                            <option value="all">Zote</option>
                            <option value="Ahadi">Ahadi</option>
                            <option value="Jengo">Jengo</option>
                        </select>
                    </div>
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

  const renderPrintHeader = () => {
      // Logic to resolve names based on IDs
      const jumuiyaName = selectedFellowship === 'all' 
        ? 'Zote' 
        : fellowships.find(f => f.id === selectedFellowship)?.name || 'Haijulikani';
      
      const bahashaType = selectedBahashaType === 'all' ? 'Zote' : selectedBahashaType;
      const ibadaType = selectedServiceType === 'all' ? 'Zote' : selectedServiceType;

      return (
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-900">
            {/* Top Row: Brand & Title */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg">
                        <Banknote className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">KanisaLetu</h1>
                        <p className="text-sm text-slate-500 font-medium">Ripoti ya Fedha</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase text-slate-800 tracking-wider">
                        {selectedReport === 'envelope' && 'Sadaka za Bahasha'}
                        {selectedReport === 'regular' && 'Sadaka za Ibada'}
                        {selectedReport === 'expense' && 'Matumizi'}
                        {selectedReport === 'jengo' && 'Ahadi za Jengo'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Imetolewa: {new Date().toLocaleDateString('sw-TZ', { dateStyle: 'long' })}</p>
                </div>
            </div>

            {/* Middle Row: Summary Metrics & Total */}
            <div className="flex justify-between items-end bg-slate-50 border border-slate-200 rounded-lg p-6">
                
                {/* Dynamic Sorting Details */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {/* Date always shows unless Jengo */}
                    {selectedReport !== 'jengo' && (
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Kipindi</span>
                            <span className="font-semibold text-slate-900">
                                {startDate ? new Date(startDate).toLocaleDateString() : 'Mwanzo'} — {endDate ? new Date(endDate).toLocaleDateString() : 'Sasa'}
                            </span>
                        </div>
                    )}

                    {/* Report Specific Filters */}
                    {(selectedReport === 'envelope' || selectedReport === 'jengo') && (
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Jumuiya</span>
                            <span className="font-semibold text-slate-900">{jumuiyaName}</span>
                        </div>
                    )}

                    {selectedReport === 'envelope' && (
                        <div className="mt-2">
                             <span className="block text-[10px] uppercase font-bold text-slate-500">Aina ya Bahasha</span>
                             <span className="font-semibold text-slate-900">{bahashaType}</span>
                        </div>
                    )}

                    {selectedReport === 'regular' && (
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-500">Aina ya Ibada</span>
                            <span className="font-semibold text-slate-900">{ibadaType}</span>
                        </div>
                    )}
                </div>

                {/* Big Total at Header */}
                <div className="text-right pl-8 border-l border-slate-200">
                    {selectedReport === 'jengo' ? (
                        <>
                             <span className="block text-xs uppercase text-slate-500 font-extrabold tracking-wider mb-1">Jumla Imekusanywa</span>
                             <span className="block text-3xl font-mono font-bold text-slate-900 leading-none">
                                {calculateTotal().toLocaleString()} <span className="text-sm font-sans font-medium text-slate-400">TZS</span>
                             </span>
                             <span className="block text-[10px] uppercase text-slate-400 font-bold mt-2">Kutoka Ahadi: {calculateTotalPledged().toLocaleString()}</span>
                        </>
                    ) : (
                        <>
                            <span className="block text-xs uppercase text-slate-500 font-extrabold tracking-wider mb-1">Jumla Kuu</span>
                            <span className="block text-3xl font-mono font-bold text-slate-900 leading-none">
                                {calculateTotal().toLocaleString()} <span className="text-sm font-sans font-medium text-slate-400">TZS</span>
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
      );
  };

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
              
              {/* Summary Text (Text-based only) - Hidden in Print (now in header) but visible on Screen */}
              <div className="mb-6 print:hidden flex flex-col gap-1">
                   <p className="text-sm uppercase text-slate-500 font-bold tracking-wider">
                       {selectedReport === 'jengo' ? 'Jumla Imekusanywa' : 'Jumla Kuu'}
                   </p>
                   <p className="text-3xl font-mono font-bold text-slate-900">{calculateTotal().toLocaleString()} TZS</p>
              </div>

              {/* Action Bar (Download) */}
              <div className="flex justify-between items-center mb-6 print:hidden">
                  <h3 className="font-bold text-slate-700">
                      {selectedReport === 'jengo' ? `Hali ya Ahadi (${reportData.length})` : `Orodha ya Miamala (${reportData.length})`}
                  </h3>
                  <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold text-sm transition-colors">
                      <Printer className="w-4 h-4 mr-2" /> Chapisha / PDF
                  </button>
              </div>

              {/* Data Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 print:border-black print:rounded-none">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs print:bg-transparent print:border-b-2 print:border-black">
                          <tr>
                              {selectedReport !== 'jengo' && (
                                <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Tarehe</th>
                              )}
                              
                              {(selectedReport === 'envelope' || selectedReport === 'jengo') && <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Namba</th>}
                              
                              {/* Only show 'Maelezo / Jina' for Expense, Envelope, Jengo reports */}
                              {selectedReport !== 'regular' && (
                                <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Maelezo / Jina</th>
                              )}

                              {selectedReport === 'jengo' && (
                                <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Jumuiya</th>
                              )}
                              
                              {selectedReport === 'envelope' && <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Aina</th>}
                              {selectedReport === 'regular' && <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black">Aina ya Ibada</th>}
                              
                              {selectedReport === 'jengo' ? (
                                  <>
                                    <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black text-right">Ahadi</th>
                                    <th className="px-6 py-4 border-b border-r border-slate-200 print:border-black text-right">Imelipwa</th>
                                    <th className="px-6 py-4 border-b border-slate-200 print:border-black text-right">Baki</th>
                                  </>
                              ) : (
                                  <th className="px-6 py-4 border-b border-slate-200 print:border-black text-right">Kiasi (TZS)</th>
                              )}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                          {reportData.map((item, idx) => (
                              <tr key={item.id || item.envelope_number || idx} className="hover:bg-slate-50 print:hover:bg-transparent">
                                  {selectedReport !== 'jengo' && (
                                      <td className="px-6 py-4 border-r border-slate-100 print:border-black">
                                          {new Date(item.offering_date || item.service_date || item.expense_date).toLocaleDateString()}
                                      </td>
                                  )}
                                  
                                  {(selectedReport === 'envelope' || selectedReport === 'jengo') && (
                                      <td className="px-6 py-4 font-mono font-bold border-r border-slate-100 print:border-black">
                                          #{item.envelope_number}
                                      </td>
                                  )}

                                  {selectedReport !== 'regular' && (
                                      <td className="px-6 py-4 border-r border-slate-100 print:border-black">
                                          {item.description || item.donor_name || '-'}
                                      </td>
                                  )}

                                  {selectedReport === 'jengo' && (
                                      <td className="px-6 py-4 border-r border-slate-100 print:border-black">
                                          {item.fellowship_name}
                                      </td>
                                  )}
                                  
                                  {selectedReport === 'envelope' && (
                                      <td className="px-6 py-4 border-r border-slate-100 print:border-black">
                                          {/* Text Based - No container style */}
                                          <span className="font-bold text-xs uppercase text-slate-700 print:text-black">
                                              {item.bahasha_type}
                                          </span>
                                      </td>
                                  )}

                                  {selectedReport === 'regular' && (
                                      <td className="px-6 py-4 border-r border-slate-100 print:border-black">
                                          {item.service_type}
                                      </td>
                                  )}

                                  {selectedReport === 'jengo' ? (
                                      <>
                                        <td className="px-6 py-4 text-right font-mono border-r border-slate-100 print:border-black">
                                            {item.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-emerald-700 border-r border-slate-100 print:border-black">
                                            {item.paid_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-rose-600 print:text-black">
                                            {item.remaining_amount.toLocaleString()}
                                        </td>
                                      </>
                                  ) : (
                                    <td className="px-6 py-4 text-right font-mono font-bold text-lg text-slate-900 print:text-black print:border-black">
                                        {item.amount.toLocaleString()}
                                    </td>
                                  )}
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              {/* Total Summary (Outside Table for Last Page Print - Bottom) */}
              <div className="flex justify-end mt-0 border-t border-slate-200 print:border-black">
                 <div className="flex items-center gap-8 px-6 py-6 border-l border-r border-b border-slate-200 bg-slate-50 print:bg-transparent print:border-black print:border-t-2 rounded-b-xl print:rounded-none">
                     <span className="uppercase text-xs text-slate-500 print:text-black font-extrabold tracking-wider">
                         {selectedReport === 'jengo' ? 'Jumla Imekusanywa' : 'Jumla Kuu'}
                     </span>
                     <span className="font-mono text-2xl text-slate-900 print:text-black font-bold">{calculateTotal().toLocaleString()}</span>
                 </div>
              </div>
              
              {/* Print Footer */}
              <div className="hidden print:block mt-12 text-center text-xs text-slate-500 border-t border-slate-300 pt-6">
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
              <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-8">
                  {renderPrintHeader()}
                  {renderTable()}
              </div>
          )}
      </div>

      {/* CSS for Printing */}
      <style>{`
          @media print {
              @page { size: A4; margin: 15mm; }
              body { background: white; -webkit-print-color-adjust: exact; }
              /* Force hide sticky header elements just in case Layout didn't catch it */
              aside, nav, header { display: none !important; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
              .print\\:flex { display: flex !important; }
              
              /* Table Styling specific for clean print */
              table { border-collapse: collapse; width: 100%; font-size: 11pt; }
              th, td { border: 1px solid #000; padding: 12px; }
              thead th { background-color: #f0f0f0 !important; color: #000 !important; font-weight: 800; }
              
              /* Ensure the table header repeats on new pages */
              thead { display: table-header-group; }
              
              /* Ensure rows don't break awkwardly */
              tr { page-break-inside: avoid; }
          }
      `}</style>
    </div>
  );
};

export default Reports;