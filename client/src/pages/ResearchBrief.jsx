import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Copy,
  RefreshCw,
  Layers,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  History as HistoryIcon,
  Loader2,
  FileCode,
  FileDown,
  Info,
  PlusCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import briefApi from '../api/briefApi';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const ResearchBrief = () => {
  const { researchId: paramResearchId } = useParams();
  const {
    currentResearch,
    currentBrief,
    briefVersions,
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

  const [activeSectionId, setActiveSectionId] = useState('');
  const [copying, setCopying] = useState(false);

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

  // Initial Brief Generation if no brief exists
  const handleGenerateInitial = async () => {
    if (!activeResId) return;
    try {
      await generateNewBrief(activeResId);
    } catch (err) {
      // Toast shown via context
    }
  };

  // Regenerate narrative
  const handleRegenerate = async () => {
    if (!activeResId) return;
    try {
      await regenerateCurrentBrief(activeResId);
    } catch (err) {
      // Toast shown via context
    }
  };

  // Export Markdown
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

  // Export PDF / HTML
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

  // Copy to Clipboard
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
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300">Loading research brief workspace...</p>
      </div>
    );
  }

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto my-12 bg-slate-900/80">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Research Projects Found</h2>
          <p className="text-base text-slate-300">
            You need to create a research project and approve its plan before generating an evidence-based brief.
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

  if (!currentResearch) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300">Selecting active research project...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            to={`/details/${currentResearch._id}`}
            className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            Evidence-Based Research Brief
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Synthesized report grounded strictly in stored empirical evidence for "{currentResearch.title}".
          </p>
        </div>

        {/* Toolbar Controls */}
        {currentBrief && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="md" onClick={handleCopyClipboard} icon={Copy}>
              {copying ? 'Copied!' : 'Copy Text'}
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
              {generatingBrief ? 'Regenerating...' : 'Regenerate Narrative'}
            </Button>
          </div>
        )}
      </div>

      {/* GENERATING SKELETON */}
      {generatingBrief && (
        <Card className="p-12 text-center bg-slate-900 border border-indigo-900/40 space-y-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Synthesizing Evidence-Based Brief</h3>
          <p className="text-base text-slate-300 max-w-lg mx-auto">
            Constructing 11 structured sections, validating claim support, attaching explicit document citations, and conducting gap analysis...
          </p>
        </Card>
      )}

      {/* NO BRIEF STATE: Generate Initial Brief */}
      {!currentBrief && !generatingBrief && (
        <Card className="p-12 text-center space-y-6 bg-slate-900/80">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white">No Brief Generated Yet</h2>
            <p className="text-base text-slate-300">
              Generate a structured 11-section research brief from your evaluated empirical evidence set.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={handleGenerateInitial} icon={Sparkles}>
            Generate Research Brief
          </Button>
        </Card>
      )}

      {/* MAIN BRIEF & SIDEBAR WORKSPACE */}
      {currentBrief && !generatingBrief && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Brief Document Body (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Document Header Banner */}
            <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 space-y-5 p-8 border-indigo-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="emerald" className="text-sm px-3.5 py-1">v{currentBrief.version}.0 FINAL BRIEF</Badge>
                  <span className="text-sm font-mono text-slate-300">
                    Generated {new Date(currentBrief.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-slate-300">Version:</span>
                  <select
                    value={currentBrief._id}
                    onChange={(e) => switchBriefVersion(e.target.value)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-indigo-300 focus:outline-none min-h-[44px]"
                  >
                    {briefVersions.map((v) => (
                      <option key={v._id} value={v._id}>
                        Version v{v.version}.0 ({new Date(v.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {currentBrief.title}
              </h1>

              <blockquote className="p-5 rounded-2xl bg-slate-950/80 border-l-4 border-indigo-500 text-base text-slate-200 italic leading-relaxed">
                "{currentBrief.summary}"
              </blockquote>
            </Card>

            {/* 11 Report Sections */}
            <div className="space-y-8">
              {currentBrief.sections?.map((sec, idx) => (
                <Card key={idx} id={`section-${idx}`} className="space-y-4 p-8 border-slate-800">
                  <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-3">
                    {sec.heading}
                  </h2>
                  <p className="text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {sec.content}
                  </p>

                  {/* Inline Citation Chips */}
                  {sec.citations && sec.citations.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                        Traceable Evidence Citations:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {sec.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 space-y-1.5 font-mono hover:border-indigo-500/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-indigo-300 font-bold">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span>{c.docName}</span>
                              <span className="text-slate-400">• Chunk {c.chunkNumber}</span>
                            </div>
                            <p className="text-xs text-slate-300 italic">"{c.excerpt}"</p>
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
            <Card className="space-y-4 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                Table of Contents
              </h3>
              <nav className="space-y-1.5 text-sm font-medium">
                {currentBrief.sections?.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors line-clamp-1 min-h-[38px] flex items-center"
                  >
                    {sec.heading}
                  </a>
                ))}
              </nav>
            </Card>

            {/* Evidence Strength Quality Card */}
            <Card className="space-y-4 p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Evidence Strength
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <span className="block text-2xl font-bold text-emerald-400">
                    {currentBrief.evidenceQuality?.highCount || 0}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">High</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60">
                  <span className="block text-2xl font-bold text-amber-400">
                    {currentBrief.evidenceQuality?.mediumCount || 0}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">Medium</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60">
                  <span className="block text-2xl font-bold text-rose-400">
                    {currentBrief.evidenceQuality?.lowCount || 0}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">Low</span>
                </div>
              </div>
            </Card>

            {/* Gap Analysis Summary */}
            {currentBrief.gapAnalysis && (
              <Card className="space-y-4 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Gap Analysis
                </h3>
                {currentBrief.gapAnalysis.recommendations && (
                  <div className="space-y-2 text-sm text-slate-300">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">Recommendations:</span>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300 leading-relaxed">
                      {currentBrief.gapAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Follow-up Questions */}
            {currentBrief.followUpQuestions && (
              <Card className="space-y-4 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  Follow-up Questions
                </h3>
                <div className="space-y-3 text-sm">
                  {currentBrief.followUpQuestions.map((q, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-medium">
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
