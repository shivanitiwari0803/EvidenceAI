import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Loader2,
  Edit3
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const NewResearch = () => {
  const navigate = useNavigate();
  const {
    currentResearch,
    currentPlan,
    createResearchProject,
    generateAIPlan,
    updatePlanSteps,
    approveCurrentPlan,
    generatingPlan,
    loading
  } = useResearch();

  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [context, setContext] = useState('');
  const [questionError, setQuestionError] = useState('');

  const [editableSteps, setEditableSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (e) => {
    const val = e.target.value;
    setResearchQuestion(val);
    if (!val.trim()) {
      setQuestionError('Research question is required.');
    } else if (val.trim().length < 10) {
      setQuestionError(`Question must be at least 10 characters. (${val.trim().length}/10)`);
    } else {
      setQuestionError('');
    }
  };

  const isQuestionValid = researchQuestion.trim().length >= 10;

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!isQuestionValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const researchData = await createResearchProject({
        title: title || 'Untitled AI Research Project',
        researchQuestion,
        context
      });

      const planData = await generateAIPlan(researchData._id);
      if (planData && planData.steps) {
        setEditableSteps(planData.steps);
      }
      setStep(2);
    } catch (err) {
      // Toast error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...editableSteps];
    updated[index][field] = value;
    setEditableSteps(updated);
  };

  const handleMoveStep = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= editableSteps.length) return;

    const updated = [...editableSteps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((s, i) => { s.order = i + 1; });
    setEditableSteps(updated);
  };

  const handleDeleteStep = (index) => {
    if (editableSteps.length <= 1) {
      showToast('Plan must contain at least 1 step', 'error');
      return;
    }
    const updated = editableSteps.filter((_, i) => i !== index);
    updated.forEach((s, i) => { s.order = i + 1; });
    setEditableSteps(updated);
  };

  const handleAddStep = () => {
    const newStepObj = {
      id: String(Date.now()),
      title: `Step ${editableSteps.length + 1}: Custom Research Action`,
      description: 'Define the empirical analysis objective for this step.',
      objective: 'Verify system bounds and performance metrics.',
      order: editableSteps.length + 1
    };
    setEditableSteps([...editableSteps, newStepObj]);
  };

  const handleApprovePlan = async () => {
    if (!currentPlan?._id) return;
    try {
      await updatePlanSteps(currentPlan._id, editableSteps);
      await approveCurrentPlan(currentPlan._id);
      navigate(`/details/${currentResearch._id}`);
    } catch (err) {
      // Handled in context
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="indigo">Step {step} of 2</Badge>
          <span className="text-xs font-mono text-slate-300">Phase 2 Workspace</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
          {step === 1 ? 'Formulate AI Research Project' : 'Review & Approve AI Research Plan'}
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          {step === 1
            ? 'Define your target research question and background context to generate an AI-powered multi-step plan.'
            : 'Inspect, edit, reorder, or add steps to your generated AI plan before approval and document ingestion.'}
        </p>
      </div>

      {/* STEP 1 FORM: Project Details */}
      {step === 1 && (
        <Card className="p-8 space-y-6">
          <form onSubmit={handleCreateProject} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-100 block">
                Project Title <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Multi-Agent Vulnerability Evaluation & Context Isolation"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-slate-100 block">
                  Research Question <span className="text-rose-400">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">Minimum 10 characters</span>
              </div>
              <textarea
                rows={4}
                required
                value={researchQuestion}
                onChange={handleQuestionChange}
                placeholder="Formulate your core research question (e.g. How does context window contamination affect subagent decision trees?)..."
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none leading-relaxed ${
                  questionError ? 'border-rose-500/60' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {questionError && (
                <p className="text-sm text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {questionError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-base font-bold text-slate-100 block">
                Research Context <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide architectural background, specific benchmarks, or target boundaries..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isQuestionValid || isSubmitting || generatingPlan}
                icon={isSubmitting || generatingPlan ? Loader2 : Sparkles}
                className={isSubmitting || generatingPlan ? 'animate-pulse' : ''}
              >
                {isSubmitting || generatingPlan ? 'Generating AI Research Plan...' : 'Generate AI Plan'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: Plan Review & Interactive Editing */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-slate-900/90 border-indigo-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge variant="emerald">Plan Generated</Badge>
                <h2 className="text-xl font-bold text-white">{currentResearch?.title}</h2>
                <p className="text-sm text-slate-300 font-medium">"{currentResearch?.researchQuestion}"</p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                  Edit Question
                </Button>
                <Button variant="success" size="md" onClick={handleApprovePlan} icon={CheckCircle2}>
                  Approve Plan & Proceed
                </Button>
              </div>
            </div>
          </Card>

          {/* Steps List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                Plan Execution Steps ({editableSteps.length})
              </h3>
              <Button variant="outline" size="sm" onClick={handleAddStep} icon={Plus}>
                Add Custom Step
              </Button>
            </div>

            {editableSteps.map((stepObj, idx) => (
              <Card key={stepObj.id || idx} className="space-y-4 p-6 border-slate-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Order: #{idx + 1}</span>
                  </div>

                  {/* Move & Delete Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, -1)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Move Up"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === editableSteps.length - 1}
                      onClick={() => handleMoveStep(idx, 1)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Move Down"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStep(idx)}
                      className="p-2.5 rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete Step"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Editable Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Step Title</label>
                    <input
                      type="text"
                      value={stepObj.title}
                      onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Step Description</label>
                    <textarea
                      rows={2}
                      value={stepObj.description}
                      onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-300">Target Objective</label>
                    <input
                      type="text"
                      value={stepObj.objective}
                      onChange={(e) => handleStepChange(idx, 'objective', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-indigo-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewResearch;
