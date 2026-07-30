import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Layers,
  ArrowLeft,
  FileCode,
  Sparkles,
  ClipboardList,
  PlusCircle,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const Documents = () => {
  const { researchId: paramResearchId } = useParams();
  const navigate = useNavigate();
  const {
    currentResearch,
    currentPlan,
    documents,
    history,
    fetchHistory,
    loadResearch,
    uploadDocumentFile,
    uploadRawTextDocument,
    deleteDoc,
    uploadingDoc
  } = useResearch();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload');
  const [pasteFilename, setPasteFilename] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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

  const isPlanApproved = Boolean(
    currentPlan?.approved || currentResearch?.status === 'PLAN_APPROVED' || currentResearch?.status === 'COMPLETED'
  );

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeResId) {
      showToast('Please select or create a research project first', 'error');
      return;
    }
    if (!isPlanApproved) {
      showToast('You must approve the AI Research Plan before uploading source documents.', 'error');
      return;
    }
    try {
      await uploadDocumentFile(activeResId, file);
      e.target.value = '';
    } catch (err) {
      // toast shown via context
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!activeResId) {
      showToast('Please select or create a research project first', 'error');
      return;
    }
    if (!isPlanApproved) {
      showToast('You must approve the AI Research Plan before uploading source documents.', 'error');
      return;
    }
    try {
      await uploadDocumentFile(activeResId, file);
    } catch (err) {
      // toast shown via context
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!activeResId) {
      showToast('Please select or create a research project first', 'error');
      return;
    }
    if (!isPlanApproved) {
      showToast('You must approve the AI Research Plan before uploading source documents.', 'error');
      return;
    }
    if (!pasteContent.trim()) {
      showToast('Please enter document text content', 'error');
      return;
    }

    try {
      await uploadRawTextDocument(
        activeResId,
        pasteFilename || `pasted_note_${Date.now()}.md`,
        pasteContent
      );
      setPasteFilename('');
      setPasteContent('');
      setActiveTab('upload');
    } catch (err) {
      // toast shown via context
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-3xl mx-auto my-12 bg-[#FAF8F2] border border-[#CBC3B2]">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F150C]">No Active Research Project</h2>
          <p className="text-base text-[#5E5648]">
            Upload documents to begin your research and extract semantic evidence.
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
  if (currentResearch && !isPlanApproved) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto font-sans">
        <Card className="p-10 text-center space-y-6 bg-[#FAF8F2] border border-[#CBC3B2] shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#D97706]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="amber">Step Locked: Plan Approval Required</Badge>
            <h2 className="text-3xl font-bold text-[#1F150C] tracking-tight">Complete Previous Step</h2>
            <p className="text-base text-[#5E5648] max-w-lg mx-auto leading-relaxed">
              You must approve the AI Research Plan before uploading source documents for "{currentResearch.title}".
            </p>
          </div>

          <div className="bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2] max-w-md mx-auto space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block">Prerequisite Checklist:</span>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex items-center gap-2 text-[#1F150C]">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                <span>1. Formulate Research Question</span>
              </div>
              <div className="flex items-center gap-2 text-[#B3261E]">
                <XCircle className="w-5 h-5 text-[#B3261E]" />
                <span>2. Approve AI Research Plan (Pending)</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/details/${currentResearch._id}`)}
            icon={ArrowRight}
          >
            Go to Plan Approval
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
          {activeResId && (
            <Link to={`/details/${activeResId}`} className="text-sm font-semibold text-[#5E5648] hover:text-[#1F150C] flex items-center gap-1.5 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
            </Link>
          )}
          <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#1F150C]" />
            Source Documents & Ingestion
          </h1>
          <p className="text-base text-[#5E5648] leading-relaxed">
            Upload PDF, DOCX, TXT, and Markdown files for "{currentResearch?.title || 'Active Project'}" (~500 words chunking with 75-word overlap).
          </p>
        </div>

        {activeResId && (
          <Link to={`/details/${activeResId}`}>
            <Button variant="primary" size="md" icon={Layers}>
              Inspect Workspace
            </Button>
          </Link>
        )}
      </div>

      {/* Upload Methods Card */}
      <Card className="p-8 space-y-6 bg-[#FAF8F2] border border-[#CBC3B2]">
        {/* Tab Selection */}
        <div className="flex items-center gap-3 border-b border-[#CBC3B2] pb-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-3 rounded-xl text-base font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-[#1F150C] text-[#FFFFFF] shadow-2xs'
                : 'text-[#5E5648] hover:bg-[#EDE8D8]'
            }`}
          >
            <Upload className="w-5 h-5" /> Upload File (PDF, DOCX, TXT, MD)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-5 py-3 rounded-xl text-base font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'paste'
                ? 'bg-[#1F150C] text-[#FFFFFF] shadow-2xs'
                : 'text-[#5E5648] hover:bg-[#EDE8D8]'
            }`}
          >
            <FileCode className="w-5 h-5" /> Paste Raw Text
          </button>
        </div>

        {/* Tab 1: File Upload / Drag Drop */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
              isDragOver
                ? 'border-[#1F150C] bg-[#EDE8D8]'
                : 'border-[#CBC3B2] hover:border-[#1F150C] bg-[#EDE8D8]'
            }`}
          >
            {uploadingDoc ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-10 h-10 text-[#1F150C] animate-spin" />
                <p className="text-lg font-bold text-[#1F150C]">Ingesting & Chunking Document...</p>
                <p className="text-base text-[#5E5648]">Extracting raw text and generating ~500-word semantic chunks.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1F150C]">
                    Upload documents to begin your research.
                  </p>
                  <p className="text-base text-[#5E5648] mt-1">Supports PDF, DOCX, TXT, Markdown (.md) up to 50MB</p>
                </div>
                <label className="inline-block pt-2">
                  <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1F150C] hover:bg-[#382819] text-[#FFFFFF] rounded-xl text-base font-semibold cursor-pointer shadow-2xs transition-colors h-[50px]">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.markdown"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Raw Text Paste */}
        {activeTab === 'paste' && (
          <form onSubmit={handlePasteSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Document Name</label>
              <input
                type="text"
                value={pasteFilename}
                onChange={(e) => setPasteFilename(e.target.value)}
                placeholder="e.g. system_architecture_notes.md"
                className="w-full h-[50px] px-4 py-3 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Raw Text Content</label>
              <textarea
                rows={6}
                required
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste technical specs, whitepapers, or markdown notes..."
                className="w-full min-h-[160px] p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C] leading-relaxed"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="lg" disabled={uploadingDoc} icon={Sparkles}>
                {uploadingDoc ? 'Processing...' : 'Save & Chunk Text Document'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Uploaded Documents List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1F150C] flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-[#1F150C]" />
            Ingested Documents ({documents.length})
          </h2>
          <span className="text-sm font-mono text-[#1F150C] font-bold bg-[#EDE8D8] px-3 py-1.5 rounded-lg border border-[#CBC3B2]">
            Total Chunks: {documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)}
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FAF8F2] border border-[#CBC3B2]">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-lg bg-[#EDE8D8] border border-[#CBC3B2] text-[#1F150C] font-mono text-sm font-bold shrink-0">
                    {doc.filename.endsWith('.pdf') ? 'PDF' : doc.filename.endsWith('.docx') ? 'DOCX' : doc.filename.endsWith('.md') ? 'MD' : 'TXT'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-[#1F150C]">{doc.filename}</h3>
                      <Badge
                        variant={
                          doc.status === 'PROCESSED'
                            ? 'emerald'
                            : doc.status === 'PROCESSING'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#5E5648]">
                      <span>Size: {formatBytes(doc.fileSize)}</span>
                      <span className="font-mono text-[#1F150C] font-semibold">{doc.chunkCount || 0} Chunks</span>
                      <span>Uploaded {new Date(doc.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="danger"
                  size="md"
                  onClick={() => deleteDoc(doc._id, activeResId)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 text-[#5E5648] text-base bg-[#FAF8F2] border border-[#CBC3B2]">
            Upload documents to begin your research. Upload a file above to begin semantic chunking and evidence extraction.
          </Card>
        )}
      </div>
    </div>
  );
};

export default Documents;
