import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  FileText,
  Layers,
  Sparkles,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';
import { evaluateWorkflowSteps } from '../../utils/workflowValidation';
import WorkflowPrerequisiteModal from '../common/WorkflowPrerequisiteModal';

export const WorkflowHeader = () => {
  const { currentResearch, currentPlan, documents, evidences, currentBrief } = useResearch();
  const location = useLocation();
  const navigate = useNavigate();
  const resId = currentResearch?._id;

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    targetStep: '',
    missingPrerequisites: [],
    redirectPath: '',
    redirectLabel: ''
  });

  if (!resId) return null;

  const { steps } = evaluateWorkflowSteps(currentResearch, currentPlan, documents, evidences, currentBrief);

  const handleStepClick = (e, step) => {
    if (step.locked) {
      e.preventDefault();
      setModalConfig({
        isOpen: true,
        targetStep: step.title,
        missingPrerequisites: step.checklist,
        redirectPath: step.redirectPath,
        redirectLabel: step.redirectLabel
      });
    }
  };

  const getIcon = (key) => {
    switch (key) {
      case 'details': return BrainCircuit;
      case 'documents': return FileText;
      case 'evidence': return Layers;
      case 'brief': return Sparkles;
      case 'chat': return MessageSquare;
      default: return BrainCircuit;
    }
  };

  return (
    <>
      <div className="bg-[#FAF8F2] border-b border-[#CBC3B2] px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-6 md:-mt-10 -mx-6 md:-mx-10 mb-8 shadow-2xs">
        {/* Active Project Title Breadcrumb */}
        <div className="flex items-center gap-3 overflow-hidden text-sm">
          <span className="font-semibold text-[#5E5648] uppercase tracking-wider text-xs">Project:</span>
          <span className="font-bold text-[#1F150C] truncate max-w-[320px] text-base">
            {currentResearch.title || 'Active Research'}
          </span>
          <span className="text-[#CBC3B2]">•</span>
          <span className="font-mono text-[#5E5648] text-xs truncate hidden sm:inline">
            {resId}
          </span>
        </div>

        {/* Stepper Tabs with Lock Validation */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {steps.map((step, idx) => {
            const Icon = getIcon(step.key);
            const isActive = location.pathname.includes(step.key);

            return (
              <React.Fragment key={step.key}>
                <NavLink
                  to={step.path}
                  onClick={(e) => handleStepClick(e, step)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 border ${
                    isActive
                      ? 'bg-[#1F150C] text-[#FFFFFF] border-[#1F150C] shadow-2xs'
                      : step.locked
                      ? 'bg-[#EDE8D8]/50 text-[#5E5648] border-[#CBC3B2] opacity-80 cursor-pointer'
                      : 'bg-[#EDE8D8] text-[#1F150C] hover:bg-[#D7D0BE] border-[#CBC3B2]'
                  }`}
                >
                  {step.locked ? (
                    <Lock className="w-4 h-4 text-[#D97706] shrink-0" />
                  ) : step.completed && !isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}

                  <span>{step.shortLabel}</span>

                  {step.completed && !isActive && (
                    <span className="text-xs text-[#2E7D32] font-bold">✓</span>
                  )}
                  {step.locked && (
                    <span className="text-xs text-[#D97706] font-mono">🔒</span>
                  )}
                </NavLink>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-[#5E5648] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Prerequisite Validation Modal */}
      <WorkflowPrerequisiteModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        targetStep={modalConfig.targetStep}
        missingPrerequisites={modalConfig.missingPrerequisites}
        redirectPath={modalConfig.redirectPath}
        redirectLabel={modalConfig.redirectLabel}
      />
    </>
  );
};

export default WorkflowHeader;
