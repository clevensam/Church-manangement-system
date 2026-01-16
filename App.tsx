import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Offerings from './components/Offerings';
import Donors from './components/Donors';
import { FileText, Download } from 'lucide-react';

const ReportsPlaceholder = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-slate-900">Ripoti</h1>
    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-medium text-slate-900 mb-2">Zalisha Ripoti za Fedha</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-6">
        Chagua aina ya ripoti hapa chini ili kupata nakala ya PDF ya taarifa za fedha.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Taarifa ya Mapato (PDF)
        </button>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Ripoti ya Matumizi (PDF)
        </button>
      </div>
    </div>
    
    {/* Simplified Table for Print View */}
    <div className="hidden print:block p-4">
        <h1 className="text-2xl font-bold mb-4">Ripoti ya Fedha ya Kanisa</h1>
        <p>Imetolewa tarehe: {new Date().toLocaleDateString()}</p>
        <div className="mt-4 border-t pt-4">
            <p className="text-center italic">Maelezo ya ripoti yataonekana hapa wakati wa kuchapisha.</p>
        </div>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSearch, setDashboardSearch] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard searchTerm={dashboardSearch} />;
      
      // Expenses Routing
      case 'expenses': 
      case 'expenses-list': return <Expenses viewMode="list" />;
      case 'expenses-add': return <Expenses viewMode="add" />;
      
      // Offerings Routing
      case 'offerings':
      case 'offerings-list': return <Offerings viewMode="list" />;
      case 'offerings-add': return <Offerings viewMode="add" />;
      
      // Donors Routing
      case 'donors':
      case 'donors-list': return <Donors viewMode="list" />;
      case 'donors-add': return <Donors viewMode="add" />;
      
      case 'reports': return <ReportsPlaceholder />;
      default: return <Dashboard searchTerm={dashboardSearch} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={setActiveTab}
      searchTerm={dashboardSearch}
      onSearch={setDashboardSearch}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;