import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { FileText, Download, Lock } from 'lucide-react';
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
const Profile = lazy(() => import('./components/Profile'));
const Reports = lazy(() => import('./components/Reports'));
const JengoPledges = lazy(() => import('./components/JengoPledges'));

// --- Access Control Configuration ---
const ROLE_PERMISSIONS: Record<string, string[]> = {
    'admin': ['dashboard', 'jengo', 'expenses', 'expenses-list', 'expenses-add', 'offerings', 'offerings-list', 'offerings-add', 'donors', 'donors-list', 'donors-add', 'reports', 'admin', 'profile'],
    'accountant': ['dashboard', 'expenses', 'expenses-list', 'expenses-add', 'offerings', 'offerings-list', 'offerings-add', 'donors', 'donors-list', 'reports', 'profile'],
    'jumuiya_leader': ['dashboard', 'jengo', 'offerings', 'offerings-list', 'offerings-add', 'donors', 'donors-list', 'donors-add', 'reports', 'profile'],
    'pastor': ['dashboard', 'expenses', 'expenses-list', 'offerings', 'offerings-list', 'donors', 'donors-list', 'reports', 'profile']
};

// --- Protected App Content ---
const AppContent = () => {
    const { session, profile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardSearch, setDashboardSearch] = useState('');

    // Reset tab to dashboard on login or role change if current tab is unauthorized
    useEffect(() => {
        if (profile) {
            const allowed = ROLE_PERMISSIONS[profile.role] || [];
            // Check if activeTab or its parent (e.g. expenses-list -> expenses) is allowed
            const isAllowed = allowed.includes(activeTab) || allowed.some(p => activeTab.startsWith(p + '-'));
            if (!isAllowed) {
                setActiveTab('dashboard');
            }
        }
    }, [profile, activeTab]);

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

    // 2. Session exists but profile loading
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

    // 4. Verify Authorization for the requested Tab
    const allowedPages = ROLE_PERMISSIONS[profile.role] || [];
    // Helper to check if current tab (e.g. expenses-list) is allowed either directly or via parent
    const isAuthorized = allowedPages.includes(activeTab) || 
                         (activeTab.includes('-') && allowedPages.includes(activeTab.split('-')[0]));

    if (!isAuthorized) {
        // Fallback UI for unauthorized access attempts (though they shouldn't happen via UI)
        return (
            <Layout activeTab={activeTab} onNavigate={setActiveTab}>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="bg-rose-50 p-4 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Huruhusiwi Kufikia Ukurasa Huu</h2>
                    <button onClick={() => setActiveTab('dashboard')} className="mt-4 text-emerald-600 font-medium hover:underline">
                        Rudi Dashibodi
                    </button>
                </div>
            </Layout>
        );
    }

    // 5. Main Content Renderer
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard searchTerm={dashboardSearch} />;
            
            case 'jengo': return <JengoPledges />;

            case 'expenses': 
            case 'expenses-list': return <Expenses viewMode="list" />;
            case 'expenses-add': return <Expenses viewMode="add" />;
            
            case 'offerings':
            case 'offerings-list': return <Offerings viewMode="list" />;
            case 'offerings-add': return <Offerings viewMode="add" />;
            
            case 'donors':
            case 'donors-list': return <Donors viewMode="list" />;
            case 'donors-add': return <Donors viewMode="add" />;
            
            case 'reports': return <Reports />;
            
            case 'admin': return <AdminUsers />;
            
            case 'profile': return <Profile />;
            
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