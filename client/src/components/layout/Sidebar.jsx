import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  FileText,
  BrainCircuit,
  MessageSquare,
  Search,
  Settings,
  FolderKanban,
  Database,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';
import { evaluateWorkflowSteps } from '../../utils/workflowValidation';
import WorkflowPrerequisiteModal from '../common/WorkflowPrerequisiteModal';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { currentResearch, currentPlan, documents, evidences, currentBrief } = useResearch();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    targetStep: '',
    missingPrerequisites: [],
    redirectPath: '',
    redirectLabel: ''
  });

  const primaryNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Research', path: '/new', icon: PlusCircle },
    { name: 'Research Projects', path: '/history', icon: FolderKanban },
    { name: 'Global Search', path: '/search', icon: Search }
  ];

  const systemNav = [
    { name: 'System Settings', path: '/settings', icon: Settings }
  ];

  const { steps } = evaluateWorkflowSteps(currentResearch, currentPlan, documents, evidences, currentBrief);

  const handlePipelineClick = (e, step) => {
    if (step.locked) {
      e.preventDefault();
      setModalConfig({
        isOpen: true,
        targetStep: step.title,
        missingPrerequisites: step.checklist,
        redirectPath: step.redirectPath,
        redirectLabel: step.redirectLabel
      });
    } else {
      if (setIsOpen) setIsOpen(false);
    }
  };

  const getStepIcon = (key) => {
    switch (key) {
      case 'details': return BrainCircuit;
      case 'documents': return FileText;
      case 'evidence': return Layers;
      case 'brief': return BrainCircuit;
      case 'chat': return MessageSquare;
      default: return BrainCircuit;
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-[#1F150C] text-[#FFFFFF] border-r border-[#332517] transition-transform duration-200 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-[#332517]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EDE8D8] text-[#1F150C] flex items-center justify-center font-bold text-lg shadow-2xs">
                E
              </div>
              <div>
                <span className="font-bold text-base text-[#FFFFFF] tracking-tight block">EvidenceAI</span>
                <span className="text-xs text-[#CBC3B2] font-mono uppercase tracking-wider">Enterprise Workspace</span>
              </div>
            </div>
          </div>

          {/* Current Active Workspace Selector */}
          {currentResearch && (
            <div className="mx-4 my-4 p-4 rounded-xl bg-[#2A1E13] border border-[#3D2D1D] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#CBC3B2]">
                <span>Active Workspace</span>
                <span className="h-2 w-2 rounded-full bg-[#2E7D32]"></span>
              </div>
              <p
                onClick={() => navigate(`/details/${currentResearch._id}`)}
                className="text-sm font-semibold text-[#FFFFFF] truncate cursor-pointer hover:text-[#EDE8D8] transition-colors"
              >
                {currentResearch.title}
              </p>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-4">
            {/* Main App Section */}
            <div className="space-y-1.5">
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#CBC3B2] block mb-2">
                Platform
              </span>
              {primaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setIsOpen && setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#EDE8D8] text-[#1F150C] font-bold shadow-2xs'
                          : 'text-[#E5E7EB] hover:text-[#FFFFFF] hover:bg-[#2A1E13]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0 text-[#FFFFFF]" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Workflow Stage Section with Step Validation Badges */}
            <div className="space-y-1.5">
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#CBC3B2] block mb-2">
                Research Pipeline
              </span>
              {steps.map((step) => {
                const Icon = getStepIcon(step.key);
                return (
                  <NavLink
                    key={step.key}
                    to={step.path}
                    onClick={(e) => handlePipelineClick(e, step)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#EDE8D8] text-[#1F150C] font-bold shadow-2xs'
                          : step.locked
                          ? 'text-[#CBC3B2]/60 hover:bg-[#2A1E13] cursor-pointer'
                          : 'text-[#E5E7EB] hover:text-[#FFFFFF] hover:bg-[#2A1E13]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0 text-[#FFFFFF]" />
                      <span>{step.shortLabel}</span>
                    </div>

                    {step.locked ? (
                      <Lock className="w-4 h-4 text-[#D97706] shrink-0" />
                    ) : step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    ) : null}
                  </NavLink>
                );
              })}
            </div>

            {/* System Section */}
            <div className="space-y-1.5">
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#CBC3B2] block mb-2">
                System
              </span>
              {systemNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen && setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#EDE8D8] text-[#1F150C] font-bold shadow-2xs'
                          : 'text-[#E5E7EB] hover:text-[#FFFFFF] hover:bg-[#2A1E13]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0 text-[#FFFFFF]" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-5 border-t border-[#332517] bg-[#160E08]">
            <div className="flex items-center justify-between text-sm text-[#E5E7EB] font-medium">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#2E7D32]" />
                Atlas Cluster
              </span>
              <span className="font-mono text-xs text-[#CBC3B2]">MongoDB</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Prerequisite Modal for Locked Sidebar Links */}
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

export default Sidebar;
