import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit,
  FileText,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Share2,
  Sparkles,
  Save,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Layers,
  MessageSquare
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const ResearchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentResearch,
    currentPlan,
    documents,
    evidences,
    currentBrief,
    loadResearch,
    updateResearchProject,
    updatePlanSteps
  } = useResearch();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editContext, setEditContext] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSavingResearch, setIsSavingResearch] = useState(false);

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [localSteps, setLocalSteps] = useState([]);

  useEffect(() => {
    if (id) {
      loadResearch(id);
    }
  }, [id, loadResearch]);

  useEffect(() => {
    if (currentResearch) {
      setEditTitle(currentResearch.title || '');
      setEditQuestion(currentResearch.researchQuestion || '');
      setEditContext(currentResearch.context || '');
    }
    if (currentPlan && currentPlan.steps) {
      setLocalSteps(currentPlan.steps);
    }
  }, [currentResearch, currentPlan]);

  const handleOpenEditModal = () => {
    if (currentResearch) {
      setEditTitle(currentResearch.title || '');
      setEditQuestion(currentResearch.researchQuestion || '');
      setEditContext(currentResearch.context || '');
      setValidationError('');
    }
    setIsModalOpen(true);
  };

  const handleQuestionChange = (e) => {
    const val = e.target.value;
    setEditQuestion(val);
    if (!val.trim()) {
      setValidationError('Research question is required.');
    } else if (val.trim().length < 10) {
      setValidationError(`Question must be at least 10 characters. (${val.trim().length}/10)`);
    } else {
      setValidationError('');
    }
  };

  const isQuestionValid = editQuestion.trim().length >= 10;

  const handleSaveResearch = async (e) => {
    e.preventDefault();
    if (!isQuestionValid || isSavingResearch) return;

    setIsSavingResearch(true);
    try {
      await updateResearchProject(id, {
        title: editTitle,
        researchQuestion: editQuestion,
        context: editContext
      });
      setIsModalOpen(false);
      showToast('Research project updated successfully');
      await loadResearch(id);
    } catch (err) {
      showToast(err.message || 'Failed to update research project', 'error');
    } finally {
      setIsSavingResearch(false);
    }
  };

  const handleSavePlanEdits = async () => {
    if (!currentPlan?._id) return;
    try {
      await updatePlanSteps(currentPlan._id, localSteps);
      setIsEditingPlan(false);
      showToast('Approved plan updated successfully');
    } catch (err) {
      // Toast shown via context
    }
  };

  const handleStepTitleChange = (idx, newTitle) => {
    const updated = [...localSteps];
    updated[idx].title = newTitle;
    setLocalSteps(updated);
  };

  const handleStepDescChange = (idx, newDesc) => {
    const updated = [...localSteps];
    updated[idx].description = newDesc;
    setLocalSteps(updated);
  };

  if (!currentResearch) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300">Loading research workspace details...</p>
      </div>
    );
  }

  const isApproved = currentResearch.status === 'PLAN_APPROVED' || currentResearch.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 space-y-6 p-8 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={isApproved ? 'emerald' : 'amber'}>
                {currentResearch.status}
              </Badge>
              <span className="text-xs font-mono text-slate-300">ID: {currentResearch._id}</span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Created {new Date(currentResearch.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {currentResearch.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link to={`/documents/${currentResearch._id}`}>
              <Button variant="secondary" size="md" icon={Upload}>
                Docs ({documents.length})
              </Button>
            </Link>

            <Link to={`/evidence/${currentResearch._id}`}>
              <Button variant="secondary" size="md" icon={Layers}>
                Evidence ({evidences.length})
              </Button>
            </Link>

            <Link to={`/brief/${currentResearch._id}`}>
              <Button variant="primary" size="md" icon={Sparkles}>
                Research Brief {currentBrief ? `v${currentBrief.version}.0` : ''}
              </Button>
            </Link>

            <Link to={`/chat/${currentResearch._id}`}>
              <Button variant="outline" size="md" icon={MessageSquare}>
                RAG Chat
              </Button>
            </Link>

            <Button variant="outline" size="md" onClick={handleOpenEditModal} icon={Edit3}>
              Edit Research
            </Button>
          </div>
        </div>

        {/* Question & Context Display */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Research Question
            </span>
            <p className="text-base text-slate-100 font-semibold leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              "{currentResearch.researchQuestion}"
            </p>
          </div>

          {currentResearch.context && (
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Research Context
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                {currentResearch.context}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Approved Plan Display */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            Approved AI Research Plan
          </h2>
          {currentPlan?.approvedAt && (
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Approved on{' '}
              {new Date(currentPlan.approvedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {currentPlan && currentPlan.steps ? (
          <div className="space-y-4">
            {localSteps.map((step, idx) => (
              <Card key={step.id || idx} className="space-y-3 p-6">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    {!isEditingPlan ? (
                      <>
                        <h3 className="font-bold text-base text-white">{step.title}</h3>
                        {step.description && (
                          <p className="text-sm text-slate-200 leading-relaxed">{step.description}</p>
                        )}
                        {step.objective && (
                          <p className="text-sm text-indigo-300 font-semibold pt-1">
                            <span className="text-xs uppercase font-bold text-indigo-400">Target Objective:</span>{' '}
                            {step.objective}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3 pt-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-slate-100"
                          placeholder="Step title"
                        />
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => handleStepDescChange(idx, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 leading-relaxed"
                          placeholder="Step description"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 text-slate-300 text-sm">
            No research plan generated for this project yet.
          </Card>
        )}
      </div>

      {/* EDIT RESEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Edit Research Project
              </h3>
              <button
                onClick={() => !isSavingResearch && setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveResearch} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-200">Project Title</label>
                <input
                  type="text"
                  disabled={isSavingResearch}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200">
                    Research Question <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">Min 10 characters</span>
                </div>
                <textarea
                  rows={3}
                  required
                  disabled={isSavingResearch}
                  value={editQuestion}
                  onChange={handleQuestionChange}
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-base text-slate-100 focus:outline-none leading-relaxed ${
                    validationError ? 'border-rose-500/60' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {validationError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-200">Research Context</label>
                <textarea
                  rows={3}
                  disabled={isSavingResearch}
                  value={editContext}
                  onChange={(e) => setEditContext(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  disabled={isSavingResearch}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isQuestionValid || isSavingResearch}
                  icon={isSavingResearch ? Loader2 : Save}
                >
                  {isSavingResearch ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetails;
