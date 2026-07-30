import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ArrowLeft,
  FileCode,
  Sparkles,
  ClipboardList,
  PlusCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const Documents = () => {
  const { researchId: paramResearchId } = useParams();
  const {
    currentResearch,
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

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
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

  // File Upload Handlers
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeResId) {
      showToast('Please select or create a research project first', 'error');
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
    try {
      await uploadDocumentFile(activeResId, file);
    } catch (err) {
      // toast shown via context
    }
  };

  // Raw Text Paste Handler
  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!activeResId) {
      showToast('Please select or create a research project first', 'error');
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

  // File size formatter
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto my-12 bg-slate-900/80">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Active Research Project Found</h2>
          <p className="text-base text-slate-300">
            Create a research project to manage source documents and extract semantic evidence.
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
          {activeResId && (
            <Link to={`/details/${activeResId}`} className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            Document Management & Ingestion
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Upload PDF, TXT, and Markdown files or paste text for "{currentResearch?.title || 'Active Project'}" (~500 words chunking with 75-word overlap).
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
      <Card className="p-6 space-y-6">
        {/* Tab Selection */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all min-h-[44px] ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload File (PDF, TXT, MD)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all min-h-[44px] ${
              activeTab === 'paste'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" /> Paste Raw Text
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
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            {uploadingDoc ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-base font-bold text-white">Ingesting & Chunking Document...</p>
                <p className="text-sm text-slate-300">Extracting raw text and generating ~500-word semantic chunks.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-100">
                    Drag and drop your research document here
                  </p>
                  <p className="text-sm text-slate-300 mt-1">Supports PDF, TXT, Markdown (.md) up to 50MB</p>
                </div>
                <label className="inline-block pt-2">
                  <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-bold cursor-pointer shadow-lg shadow-indigo-600/25 transition-all min-h-[48px]">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.markdown"
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
          <form onSubmit={handlePasteSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Document Name</label>
              <input
                type="text"
                value={pasteFilename}
                onChange={(e) => setPasteFilename(e.target.value)}
                placeholder="e.g. system_architecture_notes.md"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Raw Text Content</label>
              <textarea
                rows={6}
                required
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste technical specs, whitepapers, or markdown notes..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
            Ingested Documents ({documents.length})
          </h2>
          <span className="text-sm font-mono text-indigo-300 font-bold bg-indigo-950/80 px-3 py-1 rounded-lg border border-indigo-800/80">
            Total Chunks: {documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)}
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-mono text-sm font-bold shrink-0">
                    {doc.filename.endsWith('.pdf') ? 'PDF' : doc.filename.endsWith('.md') ? 'MD' : 'TXT'}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-white">{doc.filename}</h3>
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
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                      <span>Size: {formatBytes(doc.fileSize)}</span>
                      <span className="font-mono text-indigo-300 font-bold">{doc.chunkCount || 0} Chunks</span>
                      <span>Uploaded {new Date(doc.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => deleteDoc(doc._id, activeResId)}
                  icon={Trash2}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40"
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 text-slate-300 text-sm">
            No documents uploaded yet. Upload a file above to begin semantic chunking and evidence extraction.
          </Card>
        )}
      </div>
    </div>
  );
};

export default Documents;
