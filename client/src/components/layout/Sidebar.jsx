import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History as HistoryIcon,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  FileText,
  BrainCircuit,
  MessageSquare,
  Search,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'New Research', path: '/new', icon: PlusCircle, badge: 'Phase 2' },
  { name: 'Documents', path: '/documents', icon: FileText, badge: 'Phase 3' },
  { name: 'Evidence Viewer', path: '/evidence', icon: Layers, badge: 'Phase 3' },
  { name: 'Research Brief', path: '/brief', icon: BrainCircuit, badge: 'Phase 4' },
  { name: 'AI RAG Chat', path: '/chat', icon: MessageSquare, badge: 'Final' },
  { name: 'Global Search', path: '/search', icon: Search },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Research History', path: '/history', icon: HistoryIcon },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-72 bg-slate-900/95 border-r border-slate-800 backdrop-blur-md transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-6 py-6 border-b border-slate-800/80">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">Evidence</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
            </div>
            <p className="text-xs font-medium text-slate-300">Research Assistant Workspace</p>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="mx-4 my-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-xs font-semibold">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200">Full System Active & Ready</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 min-h-[46px] group ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Workspace Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Production Suite
            </span>
            <span className="font-mono text-xs text-slate-400">v5.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
