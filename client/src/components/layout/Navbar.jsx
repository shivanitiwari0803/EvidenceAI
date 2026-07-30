import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../../context/ResearchContext';
import api from '../../services/api';

export const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { history, currentResearch, loadResearch } = useResearch();
  const [healthStatus, setHealthStatus] = useState({ online: false, message: 'Checking API...' });
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await api.get('/health');
        if (res?.success) {
          setHealthStatus({ online: true, message: 'MongoDB Connected' });
        }
      } catch (err) {
        setHealthStatus({ online: false, message: 'Backend Disconnected' });
      }
    };
    checkApi();
  }, []);

  const handleSelectResearch = (id) => {
    if (id) {
      loadResearch(id);
      navigate(`/details/${id}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#CBC3B2] px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Project Dropdown */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-[#1F150C] hover:bg-[#D7D0BE] md:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Current Active Research Quick Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm font-semibold text-[#5E5648]">Workspace:</span>
          <select
            value={currentResearch?._id || ''}
            onChange={(e) => handleSelectResearch(e.target.value)}
            className="px-3.5 py-2 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-sm font-semibold text-[#1F150C] focus:outline-none focus:border-[#1F150C] max-w-[280px] truncate h-10"
          >
            <option value="" disabled>Select Research Project...</option>
            {history.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="relative hidden md:block w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E5648]" />
        <input
          type="text"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && quickSearch.trim()) {
              navigate(`/search?q=${encodeURIComponent(quickSearch)}`);
            }
          }}
          placeholder="Global search (press Enter)..."
          className="w-full pl-12 pr-4 h-11 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C] transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EDE8D8] border border-[#CBC3B2] text-sm">
          {healthStatus.online ? (
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          )}
          <span className="text-[#1F150C] font-medium text-xs">{healthStatus.message}</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-[#1F150C] hover:bg-[#D7D0BE] relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#1F150C]"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#CBC3B2]">
          <div className="h-9 w-9 rounded-xl bg-[#1F150C] text-[#FFFFFF] font-bold text-sm flex items-center justify-center shadow-2xs">
            EP
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-[#1F150C] leading-tight">Enterprise Researcher</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
