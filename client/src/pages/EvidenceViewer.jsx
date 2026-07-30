import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  FileText,
  Sparkles,
  ArrowLeft,
  Loader2,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  GitPullRequest,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const EvidenceViewer = () => {
  const { researchId: paramResearchId } = useParams();
  const navigate = useNavigate();
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
  const [filterClass, setFilterClass] = useState('ALL');
  const [selectedDocFilter, setSelectedDocFilter] = useState('ALL');
  const [expandedItems, setExpandedItems] = useState({});

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

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRunRetrieval = async () => {
    if (!currentResearch?._id) {
      showToast('No active research workspace loaded', 'error');
      return;
    }
    if (!documents || documents.length === 0) {
      showToast('You must upload and process documents before retrieving evidence.', 'error');
      return;
    }
    try {
      await triggerEvidenceRetrieval(currentResearch._id);
    } catch (err) {
      // toast shown via context
    }
  };

  const filteredEvidences = evidences.filter((ev) => {
    const matchesClass = filterClass === 'ALL' || ev.classification === filterClass;
    const matchesDoc = selectedDocFilter === 'ALL' || String(ev.documentId) === String(selectedDocFilter);
    const matchesSearch =
      ev.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.reason && ev.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesDoc && matchesSearch;
  });

  const planSteps = currentPlan?.steps || [
    { id: '1', order: 1, title: 'Step 1: Baseline Architecture Review', objective: 'Evaluate core boundaries' }
  ];

  const getDocName = (docId) => {
    const doc = documents.find((d) => String(d._id) === String(docId));
    return doc ? doc.filename : 'Document Source';
  };

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-3xl mx-auto my-12 bg-[#FAF8F2] border border-[#CBC3B2]">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F150C]">No Active Research Project</h2>
          <p className="text-base text-[#5E5648]">
            Retrieve evidence to continue. Create a research project to inspect semantic evidence.
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

  /* STEP VALIDATION SAFEGUARD */
  if (currentResearch && (!documents || documents.length === 0)) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto font-sans">
        <Card className="p-10 text-center space-y-6 bg-[#FAF8F2] border border-[#CBC3B2] shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#D97706]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="amber">Step Locked: Document Upload Required</Badge>
            <h2 className="text-3xl font-bold text-[#1F150C] tracking-tight">Complete Previous Step</h2>
            <p className="text-base text-[#5E5648] max-w-lg mx-auto leading-relaxed">
              You must upload and process documents before retrieving evidence for "{currentResearch.title}".
            </p>
          </div>

          <div className="bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2] max-w-md mx-auto space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block">Prerequisite Checklist:</span>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex items-center gap-2 text-[#1F150C]">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                <span>1. Approved AI Research Plan</span>
              </div>
              <div className="flex items-center gap-2 text-[#B3261E]">
                <XCircle className="w-5 h-5 text-[#B3261E]" />
                <span>2. Upload Source Documents (Missing)</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/documents/${currentResearch._id}`)}
            icon={ArrowRight}
          >
            Go to Document Upload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          {currentResearch?._id && (
            <Link to={`/details/${currentResearch._id}`} className="text-sm font-semibold text-[#5E5648] hover:text-[#1F150C] flex items-center gap-1.5 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
            </Link>
          )}
          <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
            <GitPullRequest className="w-8 h-8 text-[#1F150C]" />
            Evidence Review & Audit
          </h1>
          <p className="text-base text-[#5E5648] leading-relaxed">
            Audit empirical evidence extracted for "{currentResearch?.title || 'Active Project'}", classified by LLM confidence & reasoning.
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

      {/* Toolbar */}
      <Card className="p-6 space-y-4 bg-[#FAF8F2] border border-[#CBC3B2]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E5648]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter evidence claims, document citations, or reasoning..."
              className="w-full pl-12 pr-4 h-[50px] bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'Supporting', 'Conflicting', 'Insufficient'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors h-[50px] ${
                  filterClass === cls
                    ? cls === 'Supporting'
                      ? 'bg-[#2E7D32] text-[#FFFFFF]'
                      : cls === 'Conflicting'
                      ? 'bg-[#B3261E] text-[#FFFFFF]'
                      : cls === 'Insufficient'
                      ? 'bg-[#5E5648] text-[#FFFFFF]'
                      : 'bg-[#1F150C] text-[#FFFFFF]'
                    : 'bg-[#EDE8D8] text-[#1F150C] hover:bg-[#D7D0BE] border border-[#CBC3B2]'
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
        <Card className="p-10 text-center bg-[#FAF8F2] border border-[#1F150C] space-y-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-[#1F150C] animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-[#1F150C]">Performing Semantic Evidence Retrieval</h3>
          <p className="text-base text-[#5E5648]">
            Evaluating document chunks against approved plan steps and classifying evidence...
          </p>
        </Card>
      )}

      {/* Grouped Evidence PR-Style Cards */}
      {!retrievingEvidence && (
        <div className="space-y-8">
          {planSteps.map((step) => {
            const stepEvidences = filteredEvidences.filter(
              (ev) => String(ev.planStepId) === String(step.id) || String(ev.planStepId) === String(step.order)
            );

            return (
              <div key={step.id || step.order} className="space-y-4">
                {/* Step Banner Header */}
                <div className="flex items-center justify-between bg-[#FAF8F2] border border-[#CBC3B2] p-5 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-8 rounded-lg bg-[#1F150C] text-[#FFFFFF] font-bold text-sm flex items-center justify-center shrink-0">
                      {step.order}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-[#1F150C]">{step.title}</h2>
                      {step.objective && <p className="text-sm text-[#5E5648]">{step.objective}</p>}
                    </div>
                  </div>
                  <Badge variant="indigo">{stepEvidences.length} Claims</Badge>
                </div>

                {/* Evidence Cards PR-Diff Style */}
                {stepEvidences.length > 0 ? (
                  <div className="space-y-4">
                    {stepEvidences.map((item) => {
                      const isExpanded = Boolean(expandedItems[item._id]);
                      const isSupp = item.classification === 'Supporting';
                      const isConf = item.classification === 'Conflicting';

                      const borderStyle = isSupp
                        ? 'border-l-4 border-l-[#2E7D32] bg-[#FAF8F2] border-[#CBC3B2]'
                        : isConf
                        ? 'border-l-4 border-l-[#B3261E] bg-[#FAF8F2] border-[#CBC3B2]'
                        : 'border-l-4 border-l-[#5E5648] bg-[#FAF8F2] border-[#CBC3B2]';

                      return (
                        <div
                          key={item._id}
                          className={`border rounded-xl p-6 transition-all hover:border-[#1F150C] space-y-4 ${borderStyle}`}
                        >
                          {/* Top Row Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CBC3B2] pb-3">
                            <div className="flex items-center gap-3 flex-wrap text-sm">
                              <span className="font-bold text-[#1F150C] flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4 text-[#5E5648] shrink-0" />
                                {getDocName(item.documentId)}
                              </span>
                              <span className="text-[#CBC3B2]">•</span>
                              <span className="font-mono text-xs text-[#5E5648]">
                                Chunk #{item.chunkId ? String(item.chunkId).slice(-4) : '1'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-[#2E7D32] font-bold bg-[#2E7D32]/10 px-3 py-1 rounded-md border border-[#2E7D32]/30">
                                {item.confidence}% Confidence
                              </span>
                              <Badge
                                variant={
                                  isSupp
                                    ? 'emerald'
                                    : isConf
                                    ? 'rose'
                                    : 'slate'
                                }
                              >
                                {item.classification}
                              </Badge>
                              <button
                                onClick={() => toggleExpand(item._id)}
                                className="p-1.5 rounded-lg text-[#5E5648] hover:text-[#1F150C] hover:bg-[#EDE8D8]"
                                title="Expand Details"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Excerpt Body */}
                          <div className="text-base font-mono leading-relaxed p-4 bg-[#EDE8D8] text-[#1F150C] rounded-xl border border-[#CBC3B2]">
                            "{item.excerpt}"
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && item.reason && (
                            <div className="pt-3 border-t border-[#CBC3B2] text-sm space-y-2 bg-[#EDE8D8]/60 p-4 rounded-xl border border-[#CBC3B2]">
                              <span className="font-bold text-[#1F150C] block uppercase text-xs tracking-wider">
                                LLM Reasoning & Evidence Grounding:
                              </span>
                              <p className="text-[#5E5648] leading-relaxed font-sans">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-6 text-center text-sm text-[#5E5648] bg-[#FAF8F2] border border-[#CBC3B2]">
                    No evidence classified for this step matching criteria.
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
