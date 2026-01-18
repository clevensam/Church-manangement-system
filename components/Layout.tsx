import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  FileText, 
  CreditCard,
  Banknote,
  Search,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  List,
  PlusCircle,
  Bell,
  Settings,
  User,
  ShieldCheck 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string; icon: any }[];
  allowedRoles?: string[]; // RBAC
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, searchTerm = '', onSearch }) => {
  const { profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Define Navigation Structure with RBAC
  const allNavItems: NavItem[] = [
    { 
        id: 'dashboard', 
        label: 'Dashibodi', 
        icon: LayoutDashboard,
        allowedRoles: ['admin', 'pastor', 'accountant', 'jumuiya_leader']
    },
    { 
      id: 'expenses', 
      label: 'Matumizi', 
      icon: CreditCard,
      // UPDATED: Removed 'jumuiya_leader' from allowedRoles
      allowedRoles: ['admin', 'pastor', 'accountant'],
      subItems: [
        { id: 'expenses-list', label: 'Orodha', icon: List },
        { id: 'expenses-add', label: 'Rekodi Mpya', icon: PlusCircle }, // Permission checked inside Layout logic below
      ]
    },
    { 
      id: 'offerings', 
      label: 'Sadaka', 
      icon: Wallet,
      allowedRoles: ['admin', 'pastor', 'accountant', 'jumuiya_leader'],
      subItems: [
        { id: 'offerings-list', label: 'Orodha', icon: List },
        { id: 'offerings-add', label: 'Rekodi Mpya', icon: PlusCircle },
      ]
    },
    { 
      id: 'donors', 
      label: 'Wahumini', 
      icon: Users,
      allowedRoles: ['admin', 'pastor', 'accountant', 'jumuiya_leader'],
      subItems: [
        { id: 'donors-list', label: 'Orodha', icon: List },
        { id: 'donors-add', label: 'Sajili Mhumini', icon: PlusCircle },
      ]
    },
    { 
        id: 'reports', 
        label: 'Ripoti', 
        icon: FileText,
        allowedRoles: ['admin', 'pastor', 'accountant', 'jumuiya_leader']
    },
    { 
        id: 'admin', 
        label: 'Utawala', 
        icon: ShieldCheck, 
        allowedRoles: ['admin'] 
    },
  ];

  // Specific Logic to hide "Add/Record" sub-items for read-only roles
  const canAddExpenses = ['admin', 'accountant'].includes(profile?.role || '');
  const canAddOfferings = ['admin', 'accountant', 'jumuiya_leader'].includes(profile?.role || '');
  const canAddDonors = ['admin', 'jumuiya_leader'].includes(profile?.role || '');

  const filteredNavItems = allNavItems.filter(item => {
      // 1. Check parent role access
      if (item.allowedRoles && !item.allowedRoles.includes(profile?.role || '')) {
          return false;
      }
      return true;
  }).map(item => {
      // 2. Filter sub-items based on specific permissions
      if (item.subItems) {
          const filteredSub = item.subItems.filter(sub => {
              if (sub.id === 'expenses-add' && !canAddExpenses) return false;
              if (sub.id === 'offerings-add' && !canAddOfferings) return false;
              if (sub.id === 'donors-add' && !canAddDonors) return false;
              return true;
          });
          return { ...item, subItems: filteredSub.length > 0 ? filteredSub : undefined };
      }
      return item;
  });

  const toggleSubMenu = (itemId: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setExpandedMenus(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const getActiveParentId = () => {
      const parent = filteredNavItems.find(item => item.id === activeTab || item.subItems?.some(sub => sub.id === activeTab));
      return parent?.id;
  };

  const activeParentId = getActiveParentId();
  const activeItemLabel = filteredNavItems.flatMap(i => [i, ...(i.subItems || [])]).find(i => i.id === activeTab)?.label || 'Wasifu';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 pb-20 lg:pb-0">
      
      {/* --- LIGHT DESKTOP SIDEBAR --- */}
      <aside 
        className={`
          hidden lg:flex fixed inset-y-0 left-0 z-40 bg-white shadow-xl 
          transition-all duration-300 ease-in-out flex-col border-r border-slate-200
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Brand Section */}
        <div className={`flex items-center h-20 ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-slate-100 transition-all`}>
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 p-2.5 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
                <Banknote className="w-6 h-6 text-white" strokeWidth={2.5} />
             </div>
             <div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                <span className="font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap">KanisaFin</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Mfumo wa Fedha</span>
             </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-24 bg-white text-slate-400 hover:text-emerald-600 rounded-full p-1.5 shadow-md border border-slate-200 hover:border-emerald-200 transition-all z-50"
        >
            {isCollapsed ? <ChevronsRight className="w-3 h-3" /> : <ChevronsLeft className="w-3 h-3" />}
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden px-4 custom-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isParentActive = activeParentId === item.id;
            const hasSubItems = !!item.subItems;
            const isExpanded = expandedMenus.includes(item.id);

            return (
              <div key={item.id} className="relative group">
                  <button
                    onClick={() => hasSubItems ? toggleSubMenu(item.id) : onNavigate(item.id)}
                    title={isCollapsed ? item.label : ''}
                    className={`
                      w-full flex items-center justify-between transition-all duration-200 relative
                      ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'}
                      rounded-xl
                      ${!hasSubItems && isParentActive 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 shrink-0 ${isParentActive && !hasSubItems ? 'text-white' : (isParentActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600')}`} strokeWidth={isParentActive ? 2.5 : 2} />
                        <span className={`font-medium text-sm whitespace-nowrap transition-all ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            {item.label}
                        </span>
                    </div>
                    {hasSubItems && !isCollapsed && (
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </div>
                    )}
                    
                    {/* Collapsed Tooltip Indicator if active */}
                    {isCollapsed && isParentActive && (
                        <div className="absolute left-14 bg-emerald-600 w-1.5 h-1.5 rounded-full"></div>
                    )}
                  </button>

                  {/* Sub Menu */}
                  {hasSubItems && !isCollapsed && (
                      <div className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${isExpanded ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                      `}>
                          <div className="ml-4 pl-4 border-l border-slate-200 space-y-1 py-1">
                            {item.subItems?.map(sub => {
                                const isSubActive = activeTab === sub.id;
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => onNavigate(sub.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all
                                            ${isSubActive 
                                                ? 'bg-emerald-50 text-emerald-700 font-medium' 
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        <span>{sub.label}</span>
                                    </button>
                                );
                            })}
                          </div>
                      </div>
                  )}
              </div>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-center">
            <span className={`text-[10px] text-slate-400 ${isCollapsed ? 'hidden' : 'block'}`}>
                v1.0.0 &copy; 2024
            </span>
        </div>
      </aside>


      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe-area shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 px-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const targetId = item.subItems ? item.subItems[0].id : item.id;
            const isActive = activeParentId === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(targetId)}
                className={`group flex flex-col items-center justify-center w-full h-full relative`}
              >
                <div className={`
                    absolute top-0 w-8 h-1 rounded-b-full transition-all duration-300
                    ${isActive ? 'bg-emerald-500' : 'bg-transparent'}
                `}></div>
                
                <div className={`
                    p-1.5 rounded-2xl transition-all duration-300 mb-0.5
                    ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 group-active:scale-95'}
                `}>
                   <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`
                    text-[10px] font-medium transition-colors
                    ${isActive ? 'text-emerald-700' : 'text-slate-400'}
                `}>
                    {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>


      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        
        {/* Modern Sticky Header */}
        <header className="sticky top-0 z-30 px-4 lg:px-8 h-20 flex items-center justify-between
            bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm
        ">
            <div className="flex flex-col justify-center">
                <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
                    {activeItemLabel}
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                    {new Date().toLocaleDateString('sw-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                {/* Search */}
                {activeTab === 'dashboard' && (
                  <div className="relative group hidden sm:block">
                      <div className="flex items-center bg-slate-100/50 hover:bg-slate-100 group-focus-within:bg-white rounded-full px-4 py-2.5 border border-slate-200 group-focus-within:border-emerald-500/50 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 transition-all w-64">
                          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                              type="text" 
                              placeholder="Tafuta..." 
                              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                              value={searchTerm}
                              onChange={(e) => onSearch && onSearch(e.target.value)}
                          />
                      </div>
                  </div>
                )}
                
                {/* Actions & Profile */}
                <div className="flex items-center gap-2 lg:gap-4 pl-4 border-l border-slate-200">
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
                    
                    {/* Profile Dropdown Trigger */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white uppercase">
                                {profile?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden lg:flex flex-col items-start">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 leading-none mb-1">{profile?.full_name || 'Mtumiaji'}</span>
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none uppercase">{profile?.role}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-30 cursor-default" 
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-40 animate-in slide-in-from-top-2 duration-200">
                                    <div className="lg:hidden px-3 py-2 border-b border-slate-100 mb-2">
                                        <p className="font-bold text-slate-800">{profile?.full_name}</p>
                                        <p className="text-xs text-slate-500 uppercase">{profile?.role}</p>
                                    </div>
                                    <button 
                                        onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                                    >
                                        <User className="w-4 h-4" /> Wasifu Wangu
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" /> Mipangilio
                                    </button>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button 
                                      onClick={signOut}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Ondoka
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;