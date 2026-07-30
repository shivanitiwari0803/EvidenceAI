import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  ArrowRight,
  BrainCircuit,
  Copy,
  Archive,
  Trash2,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';

export const History = () => {
  const {
    history,
    fetchHistory,
    duplicateProject,
    toggleArchiveProject,
    deleteProject
  } = useResearch();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    const isArchived = Boolean(item.isArchived);
    if (!showArchived && isArchived) return false;

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.researchQuestion.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-indigo-400" />
            Research Workspace Management
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Manage, duplicate, archive, and resume past research projects and AI-generated execution briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all min-h-[44px] ${
              showArchived
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title or research question..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'DRAFT', 'PLAN_GENERATED', 'PLAN_APPROVED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((project) => (
            <Card key={project._id} className="space-y-4 p-6 hover:border-slate-700 transition-all flex flex-col justify-between border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'PLAN_APPROVED' || project.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                      {project.status}
                    </Badge>
                    {project.isArchived && <Badge variant="slate">Archived</Badge>}
                  </div>
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white line-clamp-1">
                  {project.title}
                </h2>

                <p className="text-sm text-slate-200 line-clamp-3 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans">
                  "{project.researchQuestion}"
                </p>
              </div>

              {/* Card Actions */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateProject(project._id)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Duplicate Project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleArchiveProject(project._id, !project.isArchived)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title={project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="p-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/details/${project._id}`}>
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12 text-slate-300 text-sm">
          No research projects found matching your criteria.
        </Card>
      )}
    </div>
  );
};

export default History;
