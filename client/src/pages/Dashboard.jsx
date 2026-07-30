import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  FileSearch,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  Search
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';

export const Dashboard = () => {
  const { history, fetchHistory } = useResearch();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const activeProjects = history.filter(p => p.status !== 'COMPLETED');
  const completedProjects = history.filter(p => p.status === 'COMPLETED' || p.status === 'PLAN_APPROVED');

  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans">
      {/* Hero Welcome Banner */}
      <Card className="p-8 space-y-6 bg-[#FAF8F2] border border-[#CBC3B2] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge variant="indigo">Enterprise Platform</Badge>
              <span className="text-sm font-mono text-[#5E5648]">v5.0 Executive</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F150C] tracking-tight leading-tight">
              Evidence-Based Research Workspace
            </h1>
            <p className="text-lg text-[#5E5648] leading-relaxed">
              Formulate research goals, generate AI execution plans, ingest documents, retrieve evidence, and synthesize verified research briefs with full citation tracing.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/new">
              <Button variant="primary" size="lg" icon={PlusCircle}>
                New Research Project
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stepper Workflow Progress Bar */}
      <Card className="p-8 bg-[#FAF8F2] border border-[#CBC3B2] space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#5E5648]">
          Research Workflow Pipeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Research', desc: 'Formulate Goal', icon: PlusCircle },
            { step: '2', title: 'Plan', desc: 'Approve Steps', icon: BrainCircuit },
            { step: '3', title: 'Evidence', desc: 'Retrieve Chunks', icon: Layers },
            { step: '4', title: 'Brief', desc: 'Synthesize Report', icon: FileText },
            { step: '5', title: 'Chat', desc: 'Query Grounded RAG', icon: Search }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] space-y-2">
                <div className="flex items-center justify-between text-sm text-[#5E5648] font-medium">
                  <span>Step {item.step}</span>
                  <Icon className="w-5 h-5 text-[#1F150C]" />
                </div>
                <p className="text-base font-semibold text-[#1F150C]">{item.title}</p>
                <p className="text-sm text-[#5E5648]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Overview Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-3 bg-[#FAF8F2] border border-[#CBC3B2]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#5E5648]">Total Workspaces</span>
            <div className="p-3 rounded-xl bg-[#1F150C]/10 text-[#1F150C] border border-[#1F150C]/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1F150C]">{history.length}</p>
          <p className="text-sm text-[#5E5648]">Initialized research projects</p>
        </Card>

        <Card className="p-6 space-y-3 bg-[#FAF8F2] border border-[#CBC3B2]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#5E5648]">Approved Plans</span>
            <div className="p-3 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1F150C]">{completedProjects.length}</p>
          <p className="text-sm text-[#5E5648]">Verified and approved plans</p>
        </Card>

        <Card className="p-6 space-y-3 bg-[#FAF8F2] border border-[#CBC3B2]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#5E5648]">Draft Workspaces</span>
            <div className="p-3 rounded-xl bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1F150C]">{activeProjects.length}</p>
          <p className="text-sm text-[#5E5648]">Pending plan approval</p>
        </Card>

        <Card className="p-6 space-y-3 bg-[#FAF8F2] border border-[#CBC3B2]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#5E5648]">Engine Core</span>
            <div className="p-3 rounded-xl bg-[#1F150C]/10 text-[#1F150C] border border-[#1F150C]/20">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#1F150C] truncate">Gemini 2.5 Flash</p>
          <p className="text-sm text-[#5E5648]">Grounded RAG Engine</p>
        </Card>
      </div>

      {/* Active & Recent Research Workspaces List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
            <FileSearch className="w-6 h-6 text-[#1F150C]" />
            Recent Research Workspaces
          </h2>
          <Link to="/history" className="text-sm font-semibold text-[#1F150C] hover:underline flex items-center gap-1.5">
            View All History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.slice(0, 4).map((project) => (
              <Card key={project._id} className="space-y-5 hover:border-[#1F150C] transition-all flex flex-col justify-between p-7 bg-[#FAF8F2] border border-[#CBC3B2]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={project.status === 'PLAN_APPROVED' || project.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                      {project.status}
                    </Badge>
                    <span className="text-sm text-[#5E5648] font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1F150C] line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-base text-[#5E5648] line-clamp-2 leading-relaxed bg-[#EDE8D8] p-4 rounded-xl border border-[#CBC3B2]">
                    "{project.researchQuestion}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#CBC3B2] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#5E5648]">
                    ID: {project._id.slice(-8)}
                  </span>

                  <Link to={`/details/${project._id}`}>
                    <Button variant="primary" size="md" icon={ArrowRight}>
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 text-[#5E5648] text-base space-y-4 bg-[#FAF8F2] border border-[#CBC3B2]">
            <p className="text-[#1F150C] font-medium">Upload documents to begin your research.</p>
            <Link to="/new">
              <Button variant="primary" size="lg" icon={PlusCircle}>
                Create Your First Research Project
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
