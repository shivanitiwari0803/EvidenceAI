import React, { createContext, useContext, useState, useCallback } from 'react';
import researchApi from '../api/researchApi';
import planApi from '../api/planApi';
import documentApi from '../api/documentApi';
import evidenceApi from '../api/evidenceApi';
import briefApi from '../api/briefApi';
import chatApi from '../api/chatApi';
import searchApi from '../api/searchApi';
import settingsApi from '../api/settingsApi';
import { useToast } from './ToastContext';

const ResearchContext = createContext(null);

export const ResearchProvider = ({ children }) => {
  const [currentResearch, setCurrentResearch] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [currentBrief, setCurrentBrief] = useState(null);
  const [briefVersions, setBriefVersions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [retrievingEvidence, setRetrievingEvidence] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const { showToast } = useToast();

  /**
   * Fetch research project by ID.
   */
  const loadResearch = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await researchApi.getResearchById(id);
      if (res?.success) {
        setCurrentResearch(res.data);
        setCurrentPlan(res.data.currentPlan || null);

        // Fetch documents, evidence, briefs, and chat history
        const docsRes = await documentApi.getDocuments(id);
        if (docsRes?.success) setDocuments(docsRes.data);

        const evRes = await evidenceApi.getEvidence(id);
        if (evRes?.success) setEvidences(evRes.data);

        try {
          const briefRes = await briefApi.getBrief(id);
          if (briefRes?.success) setCurrentBrief(briefRes.data);

          const verRes = await briefApi.getBriefVersions(id);
          if (verRes?.success) setBriefVersions(verRes.data);
        } catch (bErr) {
          setCurrentBrief(null);
          setBriefVersions([]);
        }

        try {
          const chatRes = await chatApi.getHistory(id);
          if (chatRes?.success) setChatMessages(chatRes.data);
        } catch (cErr) {
          setChatMessages([]);
        }

        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to load research project', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Send RAG Chat Message.
   */
  const sendChatMessage = async (researchId, message) => {
    setChatLoading(true);
    try {
      const res = await chatApi.sendMessage(researchId, message);
      if (res?.success) {
        setChatMessages(prev => [...prev, res.data.userMessage, res.data.assistantMessage]);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
      throw err;
    } finally {
      setChatLoading(false);
    }
  };

  /**
   * Clear Chat History.
   */
  const clearChatHistory = async (researchId) => {
    try {
      const res = await chatApi.clearHistory(researchId);
      if (res?.success) {
        setChatMessages([]);
        showToast('Chat history cleared');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear chat history', 'error');
    }
  };

  /**
   * Duplicate Research Project.
   */
  const duplicateProject = async (id) => {
    try {
      const res = await researchApi.duplicateProject(id);
      if (res?.success) {
        showToast(`Duplicated project as "${res.data.title}"`);
        await fetchHistory();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate project', 'error');
    }
  };

  /**
   * Toggle Project Archive.
   */
  const toggleArchiveProject = async (id, isArchived) => {
    try {
      const res = await researchApi.toggleArchive(id, isArchived);
      if (res?.success) {
        showToast(`Project ${isArchived ? 'archived' : 'unarchived'}`);
        await fetchHistory();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update project archive status', 'error');
    }
  };

  /**
   * Delete Research Project.
   */
  const deleteProject = async (id) => {
    try {
      const res = await researchApi.deleteProject(id);
      if (res?.success) {
        showToast('Research project deleted');
        await fetchHistory();
        if (currentResearch?._id === id) {
          setCurrentResearch(null);
        }
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete research project', 'error');
    }
  };

  /**
   * Fetch User Settings.
   */
  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsApi.getSettings();
      if (res?.success) setUserSettings(res.data);
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  }, []);

  /**
   * Update User Settings.
   */
  const updateSettings = async (data) => {
    try {
      const res = await settingsApi.updateSettings(data);
      if (res?.success) {
        setUserSettings(res.data);
        showToast('Settings saved successfully');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
  };

  /**
   * Generate initial research brief.
   */
  const generateNewBrief = async (researchId) => {
    setGeneratingBrief(true);
    try {
      const res = await briefApi.generateBrief(researchId);
      if (res?.success) {
        setCurrentBrief(res.data);
        showToast(`Research Brief v${res.data.version}.0 generated!`);
        const verRes = await briefApi.getBriefVersions(researchId);
        if (verRes?.success) setBriefVersions(verRes.data);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate research brief', 'error');
      throw err;
    } finally {
      setGeneratingBrief(false);
    }
  };

  /**
   * Regenerate brief narrative (new version).
   */
  const regenerateCurrentBrief = async (researchId) => {
    setGeneratingBrief(true);
    try {
      const res = await briefApi.regenerateBrief(researchId);
      if (res?.success) {
        setCurrentBrief(res.data);
        showToast(`Research Brief v${res.data.version}.0 regenerated!`);
        const verRes = await briefApi.getBriefVersions(researchId);
        if (verRes?.success) setBriefVersions(verRes.data);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to regenerate brief', 'error');
      throw err;
    } finally {
      setGeneratingBrief(false);
    }
  };

  /**
   * Switch active brief version.
   */
  const switchBriefVersion = async (versionId) => {
    setLoading(true);
    try {
      const res = await briefApi.getBriefVersion(versionId);
      if (res?.success) {
        setCurrentBrief(res.data);
        showToast(`Switched to Brief Version v${res.data.version}.0`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load brief version', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload Document File.
   */
  const uploadDocumentFile = async (researchId, file) => {
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('researchId', researchId);
      formData.append('file', file);

      const res = await documentApi.uploadFile(formData);
      if (res?.success) {
        showToast(`Document "${file.name}" uploaded and chunked successfully`);
        const docsRes = await documentApi.getDocuments(researchId);
        if (docsRes?.success) setDocuments(docsRes.data);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error');
      throw err;
    } finally {
      setUploadingDoc(false);
    }
  };

  /**
   * Upload Raw Text Document.
   */
  const uploadRawTextDocument = async (researchId, filename, textContent) => {
    setUploadingDoc(true);
    try {
      const res = await documentApi.uploadText({
        researchId,
        filename,
        textContent
      });
      if (res?.success) {
        showToast(`Raw text document "${filename}" saved and chunked`);
        const docsRes = await documentApi.getDocuments(researchId);
        if (docsRes?.success) setDocuments(docsRes.data);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to process raw text document', 'error');
      throw err;
    } finally {
      setUploadingDoc(false);
    }
  };

  /**
   * Delete Document.
   */
  const deleteDoc = async (id, researchId) => {
    try {
      const res = await documentApi.deleteDocument(id);
      if (res?.success) {
        showToast('Document deleted');
        if (researchId) {
          const docsRes = await documentApi.getDocuments(researchId);
          if (docsRes?.success) setDocuments(docsRes.data);
        }
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  /**
   * Trigger Evidence Retrieval & Classification.
   */
  const triggerEvidenceRetrieval = async (researchId) => {
    setRetrievingEvidence(true);
    try {
      const res = await evidenceApi.retrieveEvidence(researchId);
      if (res?.success) {
        setEvidences(res.data);
        showToast(`Evidence Retrieval Complete: ${res.data.length} items classified!`);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to retrieve evidence', 'error');
      throw err;
    } finally {
      setRetrievingEvidence(false);
    }
  };

  /**
   * Create a new research project.
   */
  const createResearchProject = async (param1, param2, param3) => {
    let title, researchQuestion, context;
    if (typeof param1 === 'object' && param1 !== null) {
      ({ title, researchQuestion, context } = param1);
    } else {
      title = param1;
      researchQuestion = param2;
      context = param3;
    }

    setLoading(true);
    try {
      const res = await researchApi.createResearch({ title, researchQuestion, context });
      if (res?.success) {
        setCurrentResearch(res.data.research || res.data);
        setCurrentPlan(res.data.plan || null);
        setDocuments([]);
        setEvidences([]);
        setCurrentBrief(null);
        setBriefVersions([]);
        setChatMessages([]);
        showToast('Research project created successfully');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create research project', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update research question or context.
   */
  const updateResearchProject = async (id, data) => {
    setLoading(true);
    try {
      const res = await researchApi.updateResearch(id, data);
      if (res?.success) {
        setCurrentResearch(res.data);
        showToast('Research project updated');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update research project', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate AI Research Plan.
   */
  const generateAIPlan = async (researchId) => {
    setGeneratingPlan(true);
    try {
      const res = await planApi.generatePlan(researchId);
      if (res?.success) {
        setCurrentPlan(res.data);
        await loadResearch(researchId);
        showToast('AI Research plan generated');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate AI plan', 'error');
      throw err;
    } finally {
      setGeneratingPlan(false);
    }
  };

  /**
   * Update Plan steps.
   */
  const updatePlanSteps = async (planId, steps) => {
    try {
      const res = await planApi.updatePlan(planId, steps);
      if (res?.success) {
        setCurrentPlan(res.data);
        showToast('Plan steps updated');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update plan steps', 'error');
      throw err;
    }
  };

  /**
   * Approve Plan with optional edited steps update.
   */
  const approveResearchPlan = async (planId, steps) => {
    setLoading(true);
    try {
      if (steps && Array.isArray(steps) && steps.length > 0) {
        await planApi.updatePlan(planId, steps);
      }
      const res = await planApi.approvePlan(planId);
      if (res?.success) {
        setCurrentPlan(res.data.plan);
        setCurrentResearch(res.data.research);
        showToast('Research plan approved successfully!');
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve research plan', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve Plan.
   */
  const approveCurrentPlan = async (planId) => {
    return approveResearchPlan(planId);
  };

  /**
   * Fetch research history.
   */
  const fetchHistory = useCallback(async () => {
    try {
      const res = await researchApi.getHistory();
      if (res?.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    }
  }, []);

  return (
    <ResearchContext.Provider
      value={{
        currentResearch,
        currentPlan,
        documents,
        evidences,
        currentBrief,
        briefVersions,
        chatMessages,
        userSettings,
        history,
        loading,
        generatingPlan,
        uploadingDoc,
        retrievingEvidence,
        generatingBrief,
        chatLoading,
        loadResearch,
        sendChatMessage,
        clearChatHistory,
        duplicateProject,
        toggleArchiveProject,
        deleteProject,
        fetchSettings,
        updateSettings,
        uploadDocumentFile,
        uploadRawTextDocument,
        deleteDoc,
        triggerEvidenceRetrieval,
        generateNewBrief,
        regenerateCurrentBrief,
        switchBriefVersion,
        createResearchProject,
        updateResearchProject,
        generateAIPlan,
        updatePlanSteps,
        approveCurrentPlan,
        approveResearchPlan,
        fetchHistory,
        setCurrentResearch,
        setCurrentPlan
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
