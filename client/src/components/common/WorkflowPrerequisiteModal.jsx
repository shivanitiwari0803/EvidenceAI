import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';
import Button from './Button';

export const WorkflowPrerequisiteModal = ({ isOpen, onClose, targetStep, missingPrerequisites, redirectPath, redirectLabel }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F150C]/60 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="bg-[#FAF8F2] border border-[#CBC3B2] rounded-2xl max-w-xl w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#CBC3B2] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1F150C]">Complete Previous Step</h3>
              <p className="text-xs text-[#5E5648] uppercase tracking-wider font-semibold">Workflow Guidance Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5E5648] hover:text-[#1F150C] p-2 rounded-xl hover:bg-[#EDE8D8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-base text-[#1F150C] font-semibold leading-relaxed">
            You need to complete the previous workflow step before continuing to <span className="font-bold underline">{targetStep}</span>.
          </p>
        </div>

        {/* Missing Prerequisites Checklist */}
        <div className="space-y-3 bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block mb-2">
            Workflow Step Checklist:
          </span>
          <div className="space-y-2.5 text-sm font-medium">
            {missingPrerequisites?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#B3261E] shrink-0" />
                )}
                <span className={item.completed ? 'text-[#1F150C] font-semibold' : 'text-[#B3261E] font-bold'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CBC3B2]">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleNavigate} icon={ArrowRight}>
            {redirectLabel || 'Go to Required Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPrerequisiteModal;
