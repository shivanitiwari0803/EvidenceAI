import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  BrainCircuit,
  Loader2,
  PlusCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const EvidenceViewer = () => {
  const { researchId: paramResearchId } = useParams();
  const {
    currentResearch,
    currentPlan,
    documents,
    evidences,
    history,
    fetchHistory,
    loadResearch,
    triggerEvidenceRetrieval,
    retrievingEvidence
  } = useResearch();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL'); // 'ALL' | 'Supporting' | 'Conflicting' | 'Insufficient'
  const [selectedDocFilter, setSelectedDocFilter] = useState('ALL');

  const activeResId = paramResearchId || currentResearch?._id;

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (activeResId) {
      loadResearch(activeResId);
    } else if (history && history.length > 0 && !currentResearch) {
      loadResearch(history[0]._id);
    }
  }, [activeResId, history, currentResearch, loadResearch]);

  // Handle Trigger Retrieval
  const handleRunRetrieval = async () => {
    if (!currentResearch?._id) {
      showToast('No active research workspace loaded', 'error');
      return;
    }
    try {
      await triggerEvidenceRetrieval(currentResearch._id);
    } catch (err) {
      // toast shown via context
    }
  };

  // Filter Evidence items
  const filteredEvidences = evidences.filter((ev) => {
    const matchesClass = filterClass === 'ALL' || ev.classification === filterClass;
    const matchesDoc = selectedDocFilter === 'ALL' || String(ev.documentId) === String(selectedDocFilter);
    const matchesSearch =
      ev.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.reason && ev.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesDoc && matchesSearch;
  });

  // Group filtered evidences by plan step
  const planSteps = currentPlan?.steps || [
    { id: '1', order: 1, title: 'Step 1: Baseline Architecture Review', objective: 'Evaluate core boundaries' }
  ];

  const getDocName = (docId) => {
    const doc = documents.find((d) => String(d._id) === String(docId));
    return doc ? doc.filename : 'Document Source';
  };

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto my-12 bg-slate-900/80">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Active Research Project Found</h2>
          <p className="text-base text-slate-300">
            Create a research project to inspect semantic evidence and LLM confidence ratings.
          </p>
        </div>
        <Link to="/new">
          <Button variant="primary" size="lg" icon={PlusCircle}>
            Create New Research Project
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          {currentResearch?._id && (
            <Link to={`/details/${currentResearch._id}`} className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-indigo-400" />
            Semantic Evidence Inspector
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Audit empirical evidence extracted from ingested documents for "{currentResearch?.title || 'Active Project'}", classified by LLM confidence & reasoning.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          disabled={retrievingEvidence || !currentResearch?._id}
          onClick={handleRunRetrieval}
          icon={retrievingEvidence ? Loader2 : Sparkles}
          className={retrievingEvidence ? 'animate-pulse' : ''}
        >
          {retrievingEvidence ? 'Retrieving Evidence...' : 'Run Evidence Retrieval'}
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence excerpts, reasoning, or keywords..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Classification Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'Supporting', 'Conflicting', 'Insufficient'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                  filterClass === cls
                    ? cls === 'Supporting'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : cls === 'Conflicting'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : cls === 'Insufficient'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {retrievingEvidence && (
        <Card className="p-12 text-center bg-slate-900 border border-indigo-900/40 space-y-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Performing Semantic Evidence Retrieval</h3>
          <p className="text-sm text-slate-300">
            Evaluating document chunks against approved plan steps and classifying evidence into Supporting, Conflicting, and Insufficient categories...
          </p>
        </Card>
      )}

      {/* Grouped Evidence by Plan Steps */}
      {!retrievingEvidence && (
        <div className="space-y-8">
          {planSteps.map((step) => {
            const stepEvidences = filteredEvidences.filter(
              (ev) => String(ev.planStepId) === String(step.id) || String(ev.planStepId) === String(step.order)
            );

            return (
              <div key={step.id || step.order} className="space-y-4">
                {/* Step Banner */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="h-9 w-9 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-sm flex items-center justify-center shrink-0">
                      {step.order}
                    </span>
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-white">{step.title}</h2>
                      {step.objective && <p className="text-xs font-medium text-slate-300">{step.objective}</p>}
                    </div>
                  </div>
                  <Badge variant="indigo">{stepEvidences.length} Evidences</Badge>
                </div>

                {/* Evidence Cards for Step */}
                {stepEvidences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stepEvidences.map((item) => (
                      <Card key={item._id} className="space-y-4 p-6 flex flex-col justify-between border-slate-800">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              {getDocName(item.documentId)}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                                {item.confidence}% Conf.
                              </span>
                              <Badge
                                variant={
                                  item.classification === 'Supporting'
                                    ? 'emerald'
                                    : item.classification === 'Conflicting'
                                    ? 'rose'
                                    : 'amber'
                                }
                              >
                                {item.classification}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-base text-slate-100 font-sans leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                            "{item.excerpt}"
                          </p>
                        </div>

                        {item.reason && (
                          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
                              LLM Reasoning:
                            </span>
                            <p className="italic text-slate-300 leading-relaxed">{item.reason}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center text-sm text-slate-400">
                    No evidence classified for this step matching your filter criteria.
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
