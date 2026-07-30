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
  TrendingUp,
  FileText,
  Layers,
  Database
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="indigo">Production Workspace</Badge>
              <span className="text-xs font-mono text-slate-300">Phase 4 Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              EvidenceAI Research Workspace
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Formulate research questions, generate AI execution plans, ingest documents, retrieve evidence, and synthesize evidence-backed briefs with full citation tracing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <Link to="/new">
              <Button variant="primary" size="lg" icon={PlusCircle}>
                New Research Project
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Overview Stat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Total Projects</span>
            <div className="p-3 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{history.length}</p>
          <p className="text-xs text-slate-400">Total initialized research workspaces</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Approved Plans</span>
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{completedProjects.length}</p>
          <p className="text-xs text-slate-400">Verified and approved AI plans</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Draft Workspaces</span>
            <div className="p-3 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/80">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{activeProjects.length}</p>
          <p className="text-xs text-slate-400">Workspaces pending plan approval</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">AI Model Provider</span>
            <div className="p-3 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/80">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xl font-bold text-white truncate">OpenAI Compatible</p>
          <p className="text-xs text-slate-400">Configured via environment API</p>
        </Card>
      </div>

      {/* Active & Recent Research Workspaces List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileSearch className="w-6 h-6 text-indigo-400" />
            Recent Research Workspaces
          </h2>
          <Link to="/history" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.slice(0, 4).map((project) => (
              <Card key={project._id} className="space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={project.status === 'PLAN_APPROVED' || project.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    "{project.researchQuestion}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    ID: {project._id.slice(-8)}
                  </span>

                  <Link to={`/details/${project._id}`}>
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 text-slate-300 text-sm space-y-3">
            <p>No research projects created yet.</p>
            <Link to="/new">
              <Button variant="primary" size="md" icon={PlusCircle}>
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
