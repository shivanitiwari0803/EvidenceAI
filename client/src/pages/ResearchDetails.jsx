import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit,
  FileText,
  Edit3,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Save,
  X,
  Loader2,
  AlertCircle,
  Upload,
  Layers,
  MessageSquare,
  FileSearch,
  CheckSquare
} from 'lucide-react';
import Card from '../components/common/Card';
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
    updateResearchProject
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
      <div className="space-y-6 max-w-4xl mx-auto py-16 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C] animate-spin">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <p className="text-base text-[#5E5648] font-medium">Loading research details...</p>
      </div>
    );
  }

  const isApproved = currentResearch.status === 'PLAN_APPROVED' || currentResearch.status === 'COMPLETED';

  const supportingCount = evidences.filter(e => e.classification === 'Supporting').length;
  const conflictingCount = evidences.filter(e => e.classification === 'Conflicting').length;

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-sm font-semibold text-[#1F150C] hover:underline transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Workspace Header Card */}
      <Card className="bg-[#FAF8F2] border border-[#CBC3B2] space-y-8 p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={isApproved ? 'emerald' : 'amber'}>
                {currentResearch.status}
              </Badge>
              <span className="text-sm font-mono text-[#5E5648]">ID: {currentResearch._id}</span>
              <span className="text-sm text-[#5E5648] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#5E5648]" />
                Created {new Date(currentResearch.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight">
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
                Brief {currentBrief ? `v${currentBrief.version}.0` : ''}
              </Button>
            </Link>

            <Link to={`/chat/${currentResearch._id}`}>
              <Button variant="secondary" size="md" icon={MessageSquare}>
                RAG Chat
              </Button>
            </Link>

            <Button variant="outline" size="md" onClick={handleOpenEditModal} icon={Edit3}>
              Edit
            </Button>
          </div>
        </div>

        {/* Question & Context Display */}
        <div className="space-y-6 pt-6 border-t border-[#CBC3B2]">
          <div>
            <span className="text-xs font-bold text-[#5E5648] uppercase tracking-wider block mb-2">
              Research Question
            </span>
            <p className="text-lg font-semibold text-[#1F150C] leading-relaxed bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2]">
              "{currentResearch.researchQuestion}"
            </p>
          </div>

          {currentResearch.context && (
            <div>
              <span className="text-xs font-bold text-[#5E5648] uppercase tracking-wider block mb-2">
                Research Context
              </span>
              <p className="text-base text-[#5E5648] leading-relaxed bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2]">
                {currentResearch.context}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Progress Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 bg-[#FAF8F2] border border-[#CBC3B2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#2E7D32]" /> Research Plan
          </span>
          <p className="text-xl font-bold text-[#1F150C]">
            {currentPlan?.approved ? 'Approved & Ready' : 'Pending Approval'}
          </p>
          <p className="text-xs text-[#5E5648] font-mono">{currentPlan?.steps?.length || 0} Execution Steps</p>
        </Card>

        <Card className="p-6 space-y-2 bg-[#FAF8F2] border border-[#CBC3B2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1F150C]" /> Documents Ingested
          </span>
          <p className="text-xl font-bold text-[#1F150C]">{documents.length} Files</p>
          <p className="text-xs text-[#5E5648] font-mono">{documents.reduce((a, d) => a + (d.chunkCount || 0), 0)} Total Chunks</p>
        </Card>

        <Card className="p-6 space-y-2 bg-[#FAF8F2] border border-[#CBC3B2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7A6A4F]" /> Evidence Claims
          </span>
          <p className="text-xl font-bold text-[#1F150C]">{evidences.length} Retrieved</p>
          <p className="text-xs text-[#2E7D32] font-semibold">{supportingCount} Supp / {conflictingCount} Conf</p>
        </Card>

        <Card className="p-6 space-y-2 bg-[#FAF8F2] border border-[#CBC3B2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1F150C]" /> Research Brief
          </span>
          <p className="text-xl font-bold text-[#1F150C]">
            {currentBrief ? `v${currentBrief.version}.0 Synthesized` : 'Not Generated'}
          </p>
          <p className="text-xs text-[#5E5648] font-mono">12 Report Sections</p>
        </Card>
      </div>

      {/* Approved Plan Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1F150C] flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[#1F150C]" />
            Approved Research Plan
          </h2>
          {currentPlan?.approvedAt && (
            <span className="text-sm font-semibold text-[#2E7D32] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" /> Approved on{' '}
              {new Date(currentPlan.approvedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {currentPlan && currentPlan.steps ? (
          <div className="space-y-4">
            {localSteps.map((step, idx) => (
              <Card key={step.id || idx} className="space-y-4 p-6 bg-[#FAF8F2] border border-[#CBC3B2]">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-full bg-[#1F150C] text-[#FFFFFF] font-bold text-base flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    {!isEditingPlan ? (
                      <>
                        <h3 className="font-bold text-lg text-[#1F150C]">{step.title}</h3>
                        {step.description && (
                          <p className="text-base text-[#5E5648] leading-relaxed">{step.description}</p>
                        )}
                        {step.objective && (
                          <p className="text-base text-[#1F150C] font-medium pt-1">
                            <span className="font-bold text-[#5E5648] uppercase text-xs">Objective:</span>{' '}
                            {step.objective}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3 pt-2 bg-[#EDE8D8] p-4 rounded-xl border border-[#CBC3B2]">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                          className="w-full h-[50px] px-4 bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C]"
                          placeholder="Step title"
                        />
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => handleStepDescChange(idx, e.target.value)}
                          className="w-full min-h-[90px] p-3 bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] leading-relaxed"
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
          <Card className="text-center p-12 text-[#5E5648] text-base bg-[#FAF8F2] border border-[#CBC3B2]">
            No research plan generated for this project yet.
          </Card>
        )}
      </div>

      {/* EDIT RESEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F150C]/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl max-w-2xl w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#CBC3B2] pb-4">
              <h3 className="text-xl font-bold text-[#1F150C] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1F150C]" />
                Edit Research Project
              </h3>
              <button
                onClick={() => !isSavingResearch && setIsModalOpen(false)}
                className="text-[#5E5648] hover:text-[#1F150C] p-2 rounded-xl hover:bg-[#EDE8D8] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveResearch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-base font-semibold text-[#1F150C]">Project Title</label>
                <input
                  type="text"
                  disabled={isSavingResearch}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[50px] px-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold text-[#1F150C]">
                    Research Question <span className="text-[#B3261E]">*</span>
                  </label>
                  <span className="text-xs text-[#5E5648] font-mono">Min 10 chars</span>
                </div>
                <textarea
                  rows={4}
                  required
                  disabled={isSavingResearch}
                  value={editQuestion}
                  onChange={handleQuestionChange}
                  className={`w-full min-h-[140px] p-4 bg-[#EDE8D8] border rounded-xl text-base text-[#1F150C] focus:outline-none leading-relaxed ${
                    validationError ? 'border-[#B3261E]' : 'border-[#CBC3B2] focus:border-[#1F150C]'
                  }`}
                />
                {validationError && (
                  <p className="text-sm text-[#B3261E] flex items-center gap-1.5 font-medium mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-base font-semibold text-[#1F150C]">Research Context</label>
                <textarea
                  rows={3}
                  disabled={isSavingResearch}
                  value={editContext}
                  onChange={(e) => setEditContext(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CBC3B2]">
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
                  {isSavingResearch ? 'Saving...' : 'Save Changes'}
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
