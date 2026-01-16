import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Users, 
    ArrowRight,
    Wallet,
    CreditCard,
    Activity,
    Calendar
} from 'lucide-react';
import { api } from '../services/supabaseService';
import { Expense, RegularOffering, EnvelopeOffering } from '../types';

type TimeRange = '7d' | '1m' | '3m' | '6m' | 'all';

interface DashboardProps {
  searchTerm?: string;
}

const COLORS = {
    primary: '#4f46e5',   // Indigo
    success: '#10b981',   // Emerald
    warning: '#f59e0b',   // Amber
    danger: '#ef4444',    // Red
    slate: '#64748b'      // Slate
};

const PIE_COLORS = [COLORS.success, COLORS.primary, COLORS.warning];

const Dashboard: React.FC<DashboardProps> = ({ searchTerm = '' }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Raw Data State
  const [rawExpenses, setRawExpenses] = useState<Expense[]>([]);
  const [rawRegular, setRawRegular] = useState<RegularOffering[]>([]);
  const [rawEnvelope, setRawEnvelope] = useState<EnvelopeOffering[]>([]);
  const [donorsCount, setDonorsCount] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [exp, reg, env, donors] = await Promise.all([
                api.expenses.getAll(),
                api.offerings.getAll(),
                api.envelopeOfferings.getAll(),
                api.donors.getAll()
            ]);
            setRawExpenses(exp);
            setRawRegular(reg);
            setRawEnvelope(env);
            setDonorsCount(donors.length);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchAllData();
  }, []);

  // 1. GLOBAL CARD STATS (Unfiltered / All Time)
  const cardStats = useMemo(() => {
      const totalExp = rawExpenses.reduce((sum, i) => sum + i.amount, 0);
      const totalReg = rawRegular.reduce((sum, i) => sum + i.amount, 0);
      const totalEnv = rawEnvelope.reduce((sum, i) => sum + i.amount, 0);
      const totalIncome = totalReg + totalEnv;

      return {
          income: totalIncome,
          expenses: totalExp,
          balance: totalIncome - totalExp,
          donors: donorsCount
      };
  }, [rawExpenses, rawRegular, rawEnvelope, donorsCount]);

  // 2. FILTER LOGIC (Applies ONLY to Charts)
  const filteredData = useMemo(() => {
      const now = new Date();
      let startDate = new Date(0); // Default all time

      if (timeRange === '7d') startDate = new Date(now.setDate(now.getDate() - 7));
      else if (timeRange === '1m') startDate = new Date(now.setMonth(now.getMonth() - 1));
      else if (timeRange === '3m') startDate = new Date(now.setMonth(now.getMonth() - 3));
      else if (timeRange === '6m') startDate = new Date(now.setMonth(now.getMonth() - 6));
      else if (customStart) startDate = new Date(customStart);

      const endDate = customEnd ? new Date(customEnd) : new Date();

      const filterDate = (dateStr: string) => {
          const d = new Date(dateStr);
          return d >= startDate && d <= endDate;
      };

      return {
          expenses: rawExpenses.filter(e => filterDate(e.expense_date)),
          regular: rawRegular.filter(r => filterDate(r.service_date)),
          envelope: rawEnvelope.filter(e => filterDate(e.offering_date))
      };
  }, [timeRange, customStart, customEnd, rawExpenses, rawRegular, rawEnvelope]);

  // 3. PREPARE CHART DATA
  const chartsData = useMemo(() => {
      const incomeMap = new Map<string, number>();
      const expenseMap = new Map<string, number>();
      
      const addToMap = (map: Map<string, number>, date: string, amount: number) => {
          if (!map.has(date)) map.set(date, 0);
          map.set(date, map.get(date)! + amount);
      };

      filteredData.regular.forEach(r => addToMap(incomeMap, r.service_date, r.amount));
      filteredData.envelope.forEach(e => addToMap(incomeMap, e.offering_date, e.amount));
      filteredData.expenses.forEach(e => addToMap(expenseMap, e.expense_date, e.amount));

      const sortDates = (map: Map<string, number>) => Array.from(map.entries())
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .map(([date, amount]) => ({
              date,
              displayDate: new Date(date).toLocaleDateString('sw-TZ', { day: '2-digit', month: 'short' }),
              amount
          }));

      return {
          income: sortDates(incomeMap),
          expenses: sortDates(expenseMap)
      };
  }, [filteredData]);

  const pieData = [
      { name: 'Sadaka', value: filteredData.regular.reduce((sum, i) => sum + i.amount, 0) },
      { name: 'Bahasha', value: filteredData.envelope.reduce((sum, i) => sum + i.amount, 0) }
  ];

  const recentTransactions = useMemo(() => {
    let all = [
      ...rawRegular.map(r => ({ ...r, type: 'income', date: r.service_date, label: r.service_type })),
      ...rawEnvelope.map(e => ({ ...e, type: 'income', date: e.offering_date, label: `Bahasha #${e.envelope_number}` })),
      ...rawExpenses.map(e => ({ ...e, type: 'expense', date: e.expense_date, label: e.description }))
    ];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      all = all.filter(item => 
        item.label.toLowerCase().includes(lower) || 
        item.amount.toString().includes(lower)
      );
    }

    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [rawRegular, rawEnvelope, rawExpenses, searchTerm]);


  if (loading) return (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8 font-sans text-slate-800 pb-8">
      
      {/* 1. Dashboard Cards (Horizontal Scroll on very small screens, Grid on others) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Income Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> +2.5%
                </span>
            </div>
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Jumla ya Mapato</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    {cardStats.income.toLocaleString()}
                </h3>
            </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-rose-600" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                    <Activity className="w-3 h-3 mr-1" /> Imelipwa
                </span>
            </div>
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Jumla ya Matumizi</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    {cardStats.expenses.toLocaleString()}
                </h3>
            </div>
        </div>

        {/* Donors Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                    <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    Hai
                </span>
            </div>
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Wahumini</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    {cardStats.donors.toLocaleString()}
                </h3>
            </div>
        </div>
      </div>

      {/* 2. Controls & Charts */}
      <div className="space-y-4 lg:space-y-6">
          {/* Mobile-Friendly Controls */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-bold text-slate-800">Uchambuzi</h2>
              
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2">
                 {/* Scrollable Presets */}
                 <div className="flex overflow-x-auto pb-1 sm:pb-0 no-scrollbar space-x-1 w-full sm:w-auto">
                    {[
                        { k: '7d', l: '7D' },
                        { k: '1m', l: '1M' },
                        { k: '3m', l: '3M' },
                        { k: '6m', l: '6M' },
                        { k: 'all', l: 'Yote' }
                    ].map(t => (
                        <button
                            key={t.k}
                            onClick={() => setTimeRange(t.k as TimeRange)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                timeRange === t.k 
                                ? 'bg-slate-900 text-white' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {t.l}
                        </button>
                    ))}
                 </div>
                 
                 <div className="w-full h-px sm:w-px sm:h-auto bg-slate-100"></div>
                 
                 {/* Custom Date Input */}
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="date" 
                            className="w-full pl-2 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                            value={customStart}
                            onChange={(e) => { setCustomStart(e.target.value); setTimeRange('all'); }}
                        />
                    </div>
                    <span className="text-slate-300 text-xs">-</span>
                     <div className="relative flex-1">
                        <input 
                            type="date" 
                            className="w-full pl-2 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                            value={customEnd}
                            onChange={(e) => { setCustomEnd(e.target.value); setTimeRange('all'); }}
                        />
                    </div>
                 </div>
              </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Mwenendo wa Mapato</h3>
                  <div className="h-56 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartsData.income} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value.toLocaleString()} TZS`, 'Kiasi']} />
                            <Area type="monotone" dataKey="amount" stroke={COLORS.success} strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Mwenendo wa Matumizi</h3>
                  <div className="h-56 lg:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.expenses} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value.toLocaleString()} TZS`, 'Kiasi']} />
                            <Bar dataKey="amount" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
         {/* Pie Chart */}
         <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Mgawanyo wa Mapato</h3>
            <div className="h-48 lg:h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} TZS`} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[10px] text-slate-400 uppercase">Jumla</span>
                     <span className="text-xs font-bold text-slate-800">{(pieData[0].value + pieData[1].value).toLocaleString()}</span>
                </div>
            </div>
            <div className="mt-2 space-y-2">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                            <span className="text-slate-600">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">
                             {((entry.value / ((pieData[0].value + pieData[1].value) || 1)) * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Recent Transactions List (Mobile Card Style) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Miamala ya Hivi Karibuni</h3>
                <button className="text-indigo-600 text-xs font-bold flex items-center">
                    Zote <ArrowRight className="w-3 h-3 ml-1" />
                </button>
            </div>
            
            <div className="flex-1 overflow-auto max-h-[400px]">
                {recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Hakuna miamala iliyopatikana.</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {recentTransactions.map((t, idx) => (
                            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{t.label}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="capitalize">{t.type === 'income' ? 'Mapato' : 'Matumizi'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-right font-mono font-medium text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;