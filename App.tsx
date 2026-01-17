import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { FileText, Download } from 'lucide-react';
import LoadingCross from './components/LoadingCross';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Expenses = lazy(() => import('./components/Expenses'));
const Offerings = lazy(() => import('./components/Offerings'));
const Donors = lazy(() => import('./components/Donors'));
const AdminUsers = lazy(() => import('./components/AdminUsers'));

// --- Placeholder for Reports ---
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
    
    <div className="hidden print:block p-4">
        <h1 className="text-2xl font-bold mb-4">Ripoti ya Fedha ya Kanisa</h1>
        <p>Imetolewa tarehe: {new Date().toLocaleDateString()}</p>
        <div className="mt-4 border-t pt-4">
            <p className="text-center italic">Maelezo ya ripoti yataonekana hapa wakati wa kuchapisha.</p>
        </div>
    </div>
  </div>
);

// --- Protected App Content ---
const AppContent = () => {
    const { session, profile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardSearch, setDashboardSearch] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingCross />
            </div>
        );
    }

    // 1. No Session -> Login Screen
    if (!session) {
        return <Login />;
    }

    // 2. Session exists but profile loading -> Spinner (avoids flash of 'ChangePassword')
    if (!profile) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingCross />
            </div>
        );
    }

    // 3. Forced Password Change
    if (profile.must_change_password) {
        return <ChangePassword />;
    }

    // 4. Main Application
    const renderContent = () => {
        switch (activeTab) {
        case 'dashboard': return <Dashboard searchTerm={dashboardSearch} />;
        case 'expenses': 
        case 'expenses-list': return <Expenses viewMode="list" />;
        case 'expenses-add': return <Expenses viewMode="add" />;
        case 'offerings':
        case 'offerings-list': return <Offerings viewMode="list" />;
        case 'offerings-add': return <Offerings viewMode="add" />;
        case 'donors':
        case 'donors-list': return <Donors viewMode="list" />;
        case 'donors-add': return <Donors viewMode="add" />;
        case 'reports': return <ReportsPlaceholder />;
        case 'admin':
            if (profile.role === 'admin') return <AdminUsers />;
            return <div className="p-8 text-center text-rose-500">Hauna ruhusa ya kuona ukurasa huu.</div>;
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
            <Suspense fallback={
                <div className="h-[60vh] flex items-center justify-center">
                    <LoadingCross />
                </div>
            }>
                {renderContent()}
            </Suspense>
        </Layout>
    );
};

// --- Main App Wrapper ---
function App() {
  return (
    <ErrorBoundary>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;