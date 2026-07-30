import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  ArrowRight,
  Copy,
  Archive,
  Trash2
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
    <div className="space-y-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-[#1F150C]" />
            Research Workspace Management
          </h1>
          <p className="text-lg text-[#5E5648] leading-relaxed">
            Manage, duplicate, archive, and resume past research projects and execution briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-5 py-3 rounded-xl text-base font-semibold border transition-colors h-[50px] ${
              showArchived
                ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
                : 'bg-[#F8F6EF] text-[#1F150C] border-[#CBC3B2] hover:bg-[#D7D0BE]'
            }`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-6 space-y-4 bg-[#F8F6EF] border border-[#CBC3B2]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E5648]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title or research question..."
              className="w-full h-[50px] pl-12 pr-4 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'DRAFT', 'PLAN_GENERATED', 'PLAN_APPROVED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors h-[50px] ${
                  statusFilter === st
                    ? 'bg-[#1F150C] text-[#FFFFFF] shadow-2xs'
                    : 'bg-[#E1DCC9] text-[#1F150C] hover:bg-[#D7D0BE] border border-[#CBC3B2]'
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
            <Card key={project._id} className="space-y-5 p-6 hover:border-[#1F150C] transition-all flex flex-col justify-between bg-[#F8F6EF] border border-[#CBC3B2]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'PLAN_APPROVED' || project.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                      {project.status}
                    </Badge>
                    {project.isArchived && <Badge variant="slate">Archived</Badge>}
                  </div>
                  <span className="text-sm text-[#5E5648] font-mono flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#5E5648]" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#1F150C] line-clamp-1">
                  {project.title}
                </h2>

                <p className="text-base text-[#5E5648] line-clamp-3 leading-relaxed bg-[#E1DCC9] p-4 rounded-xl border border-[#CBC3B2]">
                  "{project.researchQuestion}"
                </p>
              </div>

              {/* Card Actions */}
              <div className="space-y-3 pt-3 border-t border-[#CBC3B2]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => duplicateProject(project._id)}
                      className="p-2 rounded-lg text-[#5E5648] hover:text-[#1F150C] hover:bg-[#E1DCC9]"
                      title="Duplicate Project"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleArchiveProject(project._id, !project.isArchived)}
                      className="p-2 rounded-lg text-[#5E5648] hover:text-[#D97706] hover:bg-[#E1DCC9]"
                      title={project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="p-2 rounded-lg text-[#B3261E] hover:bg-[#B3261E]/10"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <Link to={`/details/${project._id}`}>
                    <Button variant="primary" size="md" icon={ArrowRight}>
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-12 text-[#5E5648] text-base bg-[#F8F6EF] border border-[#CBC3B2]">
          No research projects found matching your criteria.
        </Card>
      )}
    </div>
  );
};

export default History;
