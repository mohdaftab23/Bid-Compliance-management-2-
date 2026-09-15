import React from 'react';
import { Shield, Sparkles, AlertTriangle, FileText, BarChart3, History, Settings, Users, Building, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  aiConnected: boolean;
  onOpenAIConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  userRole,
  onToggleRole,
  aiConnected,
  onOpenAIConfig,
}) => {
  const navItems = userRole === 'OFFICER' ? [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tenders', label: 'Active Tenders', icon: FileText },
    { id: 'comparison', label: 'Bidder Due Diligence', icon: Sparkles },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] : [
    { id: 'submissions', label: 'My Submissions', icon: Building },
    { id: 'tender-browser', label: 'Tender Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner: Mandatory Decision Support & Human Review Statement */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-medium text-slate-300">Government Procurement Decision-Support System:</span>
          <span className="hidden sm:inline">AI provides evidence-based analysis & explainable scoring. Final award decisions strictly remain with authorized human procurement officers.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">Security Standard: Gov-Enterprise Audit Level 4</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-inner border border-blue-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">Procure<span className="text-blue-400">AI</span></span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 uppercase tracking-wider">
                  Gov Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Tender Due-Diligence & Decision Support</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'comparison' && currentView === 'report');
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: AI Status & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* AI Engine Connection Indicator */}
            <button
              onClick={onOpenAIConfig}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                aiConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900/90'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900/90'
              }`}
              title="Click to configure AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiConnected ? 'AI: Connected ✓' : 'Configure AI'}</span>
              <span className={`w-2 h-2 rounded-full ${aiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={onToggleRole}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  userRole === 'OFFICER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Procurement Officer view"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Officer</span>
              </button>
              <button
                onClick={onToggleRole}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  userRole === 'BIDDER'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Bidder / Vendor view"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bidder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
