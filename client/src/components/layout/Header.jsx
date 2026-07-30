import React from 'react';
import { Menu, Sparkles, Database } from 'lucide-react';
import Badge from '../common/Badge';

export const Header = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white tracking-tight hidden sm:inline-block">
              EvidenceAI Workspace
            </span>
            <Badge variant="indigo" className="text-xs">
              Vite + Express + OpenAI
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>MongoDB Atlas Connected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-200">System Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
