import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export const Navbar = ({ toggleSidebar }) => {
  const [healthStatus, setHealthStatus] = useState({ online: false, message: 'Checking API...' });

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await api.get('/health');
        if (res?.success) {
          setHealthStatus({ online: true, message: 'Backend Connected' });
        }
      } catch (err) {
        setHealthStatus({ online: false, message: 'Backend Offline (Standalone)' });
      }
    };
    checkApi();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search research plans, evidence..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
          {healthStatus.online ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-slate-300 font-medium">{healthStatus.message}</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-slate-800">
            SE
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Staff Architect</p>
            <p className="text-[10px] text-slate-400">staff@evidence.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
