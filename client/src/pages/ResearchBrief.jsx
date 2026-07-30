import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Copy,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  FileCode,
  FileDown,
  PlusCircle,
  BookmarkCheck,
  Lock,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import briefApi from '../api/briefApi';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const ResearchBrief = () => {
  const { researchId: paramResearchId } = useParams();
  const navigate = useNavigate();
  const {
    currentResearch,
    currentBrief,
    briefVersions,
    evidences,
    history,
    fetchHistory,
    loadResearch,
    generateNewBrief,
    regenerateCurrentBrief,
    switchBriefVersion,
    generatingBrief,
    loading
  } = useResearch();

  const { showToast } = useToast();
  const activeResId = paramResearchId || currentResearch?._id;

  const [copying, setCopying] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [editableSections, setEditableSections] = useState([]);
  const [savingReview, setSavingReview] = useState(false);

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

  useEffect(() => {
    if (currentBrief && currentBrief.sections) {
      setEditableSections(currentBrief.sections);
    }
  }, [currentBrief]);

  const handleSectionTextChange = (idx, newContent) => {
    const updated = [...editableSections];
    updated[idx].content = newContent;
    setEditableSections(updated);
  };

  const handleRejectSectionContent = (idx) => {
    const updated = [...editableSections];
    updated[idx].content = `[REJECTED - UNSUPPORTED CONCLUSION]: This claim was flagged and rejected during human review due to insufficient empirical evidence backing in source documentation.`;
    setEditableSections(updated);
    showToast(`Section ${idx + 1} conclusion rejected`);
  };

  const handleSaveApproveReview = async (status = 'APPROVED') => {
    if (!currentBrief?._id) return;
    setSavingReview(true);
    try {
      const res = await briefApi.updateBriefVersion(currentBrief._id, {
        sections: editableSections,
        reviewStatus: status
      });
      if (res?.success) {
        setIsReviewing(false);
        showToast(`Research Brief conclusions reviewed & status marked as ${status}!`);
        await loadResearch(activeResId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save brief review', 'error');
    } finally {
      setSavingReview(false);
    }
  };

  const handleGenerateInitial = async () => {
    if (!activeResId) return;
    try {
      await generateNewBrief(activeResId);
    } catch (err) {
      // Toast shown via context
    }
  };

  const handleRegenerate = async () => {
    if (!activeResId) return;
    try {
      await regenerateCurrentBrief(activeResId);
    } catch (err) {
      // Toast shown via context
    }
  };

  const handleExportMarkdown = async () => {
    if (!currentBrief?._id) return;
    try {
      const res = await briefApi.exportMarkdown(currentBrief._id);
      if (res?.success) {
        const blob = new Blob([res.data.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.data.filename || 'research_brief.md';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported Markdown file successfully');
      }
    } catch (err) {
      showToast('Failed to export Markdown', 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!currentBrief?._id) return;
    try {
      const response = await briefApi.exportPdf(currentBrief._id);
      const blob = new Blob([response], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentBrief.title || 'brief'}.html`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported PDF/HTML report successfully');
    } catch (err) {
      showToast('Failed to export PDF report', 'error');
    }
  };

  const handleCopyClipboard = () => {
    if (!currentBrief) return;
    let fullText = `${currentBrief.title}\n\n${currentBrief.summary}\n\n`;
    currentBrief.sections?.forEach((sec) => {
      fullText += `${sec.heading}\n${sec.content}\n\n`;
    });
    navigator.clipboard.writeText(fullText);
    setCopying(true);
    showToast('Copied full brief text to clipboard');
    setTimeout(() => setCopying(false), 2000);
  };

  if (loading && !currentResearch) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-16 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C] animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-base text-[#5E5648] font-medium">Loading research brief workspace...</p>
      </div>
    );
  }

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-3xl mx-auto my-12 bg-[#FAF8F2] border border-[#CBC3B2]">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F150C]">No Research Projects Found</h2>
          <p className="text-base text-[#5E5648]">
            Generate a research plan first. You need to create a project and approve its plan before synthesizing a brief.
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
  const isEvidenceRetrieved = Boolean(evidences && evidences.length > 0);
  if (currentResearch && !isEvidenceRetrieved && !currentBrief) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto font-sans">
        <Card className="p-10 text-center space-y-6 bg-[#FAF8F2] border border-[#CBC3B2] shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#D97706]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="amber">Step Locked: Evidence Retrieval Required</Badge>
            <h2 className="text-3xl font-bold text-[#1F150C] tracking-tight">Complete Previous Step</h2>
            <p className="text-base text-[#5E5648] max-w-lg mx-auto leading-relaxed">
              You must retrieve evidence before generating the Research Brief for "{currentResearch.title}".
            </p>
          </div>

          <div className="bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2] max-w-md mx-auto space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block">Prerequisite Checklist:</span>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex items-center gap-2 text-[#1F150C]">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                <span>1. Upload Source Documents</span>
              </div>
              <div className="flex items-center gap-2 text-[#B3261E]">
                <XCircle className="w-5 h-5 text-[#B3261E]" />
                <span>2. Retrieve Evidence Chunks (Missing)</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/evidence/${currentResearch._id}`)}
            icon={ArrowRight}
          >
            Go to Evidence Retrieval
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans">
      {/* Sticky Top Toolbar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#CBC3B2] py-4 px-8 -mx-8 rounded-b-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={`/details/${currentResearch._id}`}
            className="text-sm font-semibold text-[#5E5648] hover:text-[#1F150C] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
          </Link>
          <h1 className="text-lg font-bold text-[#1F150C] tracking-tight flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#1F150C]" />
            {currentBrief ? currentBrief.title : 'Evidence-Based Research Brief'}
          </h1>
        </div>

        {/* Toolbar Action Buttons */}
        {currentBrief && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={isReviewing ? 'secondary' : 'outline'}
              size="md"
              onClick={() => setIsReviewing(!isReviewing)}
              icon={BookmarkCheck}
            >
              {isReviewing ? 'Exit Review' : 'Review Conclusions'}
            </Button>
            {isReviewing && (
              <Button
                variant="success"
                size="md"
                disabled={savingReview}
                onClick={() => handleSaveApproveReview('APPROVED')}
                icon={CheckCircle2}
              >
                Approve Final Brief
              </Button>
            )}
            <Button variant="outline" size="md" onClick={handleCopyClipboard} icon={Copy}>
              {copying ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="secondary" size="md" onClick={handleExportMarkdown} icon={FileCode}>
              Markdown
            </Button>
            <Button variant="secondary" size="md" onClick={handleExportPdf} icon={FileDown}>
              PDF / HTML
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={generatingBrief}
              onClick={handleRegenerate}
              icon={generatingBrief ? Loader2 : RefreshCw}
              className={generatingBrief ? 'animate-spin' : ''}
            >
              {generatingBrief ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        )}
      </div>

      {/* GENERATING SKELETON */}
      {generatingBrief && (
        <Card className="p-12 text-center bg-[#FAF8F2] border border-[#1F150C] space-y-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-[#1F150C] animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-[#1F150C]">Synthesizing 12-Section Evidence-Based Brief</h3>
          <p className="text-base text-[#5E5648] max-w-lg mx-auto">
            Constructing structured report sections, attaching traceable citations, and performing gap analysis...
          </p>
        </Card>
      )}

      {/* NO BRIEF STATE */}
      {!currentBrief && !generatingBrief && (
        <Card className="p-12 text-center space-y-6 bg-[#FAF8F2] border border-[#CBC3B2]">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-[#1F150C]">No Brief Generated Yet</h2>
            <p className="text-base text-[#5E5648]">
              Synthesize a structured 12-section research brief from your evaluated empirical evidence set.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={handleGenerateInitial} icon={Sparkles}>
            Generate 12-Section Brief
          </Button>
        </Card>
      )}

      {/* MAIN BRIEF & SIDEBAR WORKSPACE */}
      {currentBrief && !generatingBrief && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Brief Document Body (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Document Header Banner */}
            <Card className="bg-[#FAF8F2] border border-[#CBC3B2] space-y-6 p-8 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#CBC3B2] pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="emerald">v{currentBrief.version}.0 FINAL BRIEF</Badge>
                  <span className="text-sm font-mono text-[#5E5648]">
                    Generated {new Date(currentBrief.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#5E5648]">Version:</span>
                  <select
                    value={currentBrief._id}
                    onChange={(e) => switchBriefVersion(e.target.value)}
                    className="px-3 py-2 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-sm font-mono text-[#1F150C] focus:outline-none"
                  >
                    {briefVersions.map((v) => (
                      <option key={v._id} value={v._id}>
                        Version v{v.version}.0 ({new Date(v.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1F150C] tracking-tight">
                {currentBrief.title}
              </h1>

              {/* Summary Box */}
              <div className="p-6 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] text-lg text-[#1F150C] italic leading-relaxed">
                "{currentBrief.summary}"
              </div>
            </Card>

            {/* 12 Report Sections */}
            <div className="space-y-8">
              {(isReviewing ? editableSections : currentBrief.sections)?.map((sec, idx) => (
                <Card key={idx} id={`section-${idx}`} className="space-y-4 p-8 bg-[#FAF8F2] border border-[#CBC3B2]">
                  <div className="flex items-center justify-between border-b border-[#CBC3B2] pb-4">
                    <h2 className="text-2xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
                      <BookmarkCheck className="w-6 h-6 text-[#1F150C]" />
                      {sec.heading}
                    </h2>
                    {isReviewing && (
                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => handleRejectSectionContent(idx)}
                      >
                        Reject Conclusion
                      </Button>
                    )}
                  </div>

                  {!isReviewing ? (
                    <p className="text-base text-[#1F150C] leading-[1.7] font-sans whitespace-pre-line">
                      {sec.content}
                    </p>
                  ) : (
                    <textarea
                      rows={5}
                      value={sec.content}
                      onChange={(e) => handleSectionTextChange(idx, e.target.value)}
                      className="w-full p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] font-sans leading-relaxed focus:outline-none focus:border-[#1F150C] min-h-[140px]"
                    />
                  )}

                  {/* Inline Citation Chips */}
                  {sec.citations && sec.citations.length > 0 && (
                    <div className="pt-4 border-t border-[#CBC3B2] space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block">
                        Traceable Citations:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {sec.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3.5 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] text-sm text-[#1F150C] space-y-1.5 font-mono hover:border-[#1F150C] transition-colors"
                          >
                            <div className="flex items-center gap-2 text-[#1F150C] font-semibold">
                              <FileText className="w-4 h-4 shrink-0 text-[#1F150C]" />
                              <span>{c.docName}</span>
                              <span className="text-[#5E5648]">• Chunk {c.chunkNumber}</span>
                            </div>
                            <p className="text-xs text-[#5E5648] italic">"{c.excerpt}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Panel (1 col) */}
          <div className="space-y-6">
            {/* Table of Contents */}
            <Card className="space-y-4 p-6 sticky top-24 bg-[#FAF8F2] border border-[#CBC3B2]">
              <h3 className="text-sm font-bold text-[#1F150C] uppercase tracking-wider flex items-center gap-2 border-b border-[#CBC3B2] pb-3">
                <FileText className="w-5 h-5 text-[#1F150C]" />
                Contents (12 Sections)
              </h3>
              <nav className="space-y-1.5 text-sm font-medium max-h-[400px] overflow-y-auto">
                {currentBrief.sections?.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block px-3 py-2 rounded-lg text-[#5E5648] hover:text-[#1F150C] hover:bg-[#EDE8D8] transition-colors truncate"
                  >
                    {sec.heading}
                  </a>
                ))}
              </nav>
            </Card>

            {/* Evidence Quality Metrics */}
            <Card className="space-y-4 p-6 bg-[#FAF8F2] border border-[#CBC3B2]">
              <h3 className="text-sm font-bold text-[#1F150C] uppercase tracking-wider flex items-center gap-2 border-b border-[#CBC3B2] pb-3">
                <Sparkles className="w-5 h-5 text-[#2E7D32]" />
                Evidence Quality
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20">
                  <span className="block text-2xl font-bold text-[#2E7D32]">
                    {currentBrief.evidenceQuality?.highCount || 0}
                  </span>
                  <span className="text-xs text-[#2E7D32] font-semibold">High</span>
                </div>
                <div className="p-3 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20">
                  <span className="block text-2xl font-bold text-[#D97706]">
                    {currentBrief.evidenceQuality?.mediumCount || 0}
                  </span>
                  <span className="text-xs text-[#D97706] font-semibold">Medium</span>
                </div>
                <div className="p-3 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2]">
                  <span className="block text-2xl font-bold text-[#5E5648]">
                    {currentBrief.evidenceQuality?.lowCount || 0}
                  </span>
                  <span className="text-xs text-[#5E5648] font-semibold">Low</span>
                </div>
              </div>
            </Card>

            {/* Weak Evidence Box */}
            {currentBrief.weakEvidence && currentBrief.weakEvidence.length > 0 && (
              <Card className="space-y-4 p-6 bg-[#D97706]/10 border border-[#D97706]/20">
                <h3 className="text-sm font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-2 border-b border-[#D97706]/20 pb-3">
                  <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                  Weak Evidence Flagged
                </h3>
                <div className="space-y-3 text-sm">
                  {currentBrief.weakEvidence.map((w, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#EDE8D8] border border-[#D97706]/20 space-y-1.5">
                      <p className="font-semibold text-[#1F150C]">"{w.claim}"</p>
                      <p className="text-xs text-[#D97706]">Reason: {w.reason}</p>
                      <p className="text-xs text-[#5E5648] italic">Suggested: {w.suggestedEvidence}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations Box */}
            {currentBrief.gapAnalysis?.recommendations && (
              <Card className="space-y-4 p-6 bg-[#FAF8F2] border border-[#CBC3B2]">
                <h3 className="text-sm font-bold text-[#1F150C] uppercase tracking-wider flex items-center gap-2 border-b border-[#CBC3B2] pb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                  Recommendations
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#5E5648] leading-relaxed">
                  {currentBrief.gapAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Unanswered Questions Box */}
            {currentBrief.followUpQuestions && (
              <Card className="space-y-4 p-6 bg-[#FAF8F2] border border-[#CBC3B2]">
                <h3 className="text-sm font-bold text-[#1F150C] uppercase tracking-wider flex items-center gap-2 border-b border-[#CBC3B2] pb-3">
                  <HelpCircle className="w-5 h-5 text-[#1F150C]" />
                  Unanswered Questions
                </h3>
                <div className="space-y-3 text-sm">
                  {currentBrief.followUpQuestions.map((q, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] text-[#1F150C] font-medium">
                      ❓ {q}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchBrief;
