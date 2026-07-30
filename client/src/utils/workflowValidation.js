export const evaluateWorkflowSteps = (currentResearch, currentPlan, documents = [], evidences = [], currentBrief = null) => {
  const isResearchCreated = Boolean(currentResearch?._id && currentResearch?.researchQuestion);
  const isPlanGenerated = Boolean(currentPlan?._id);
  const isPlanApproved = Boolean(currentPlan?.approved || currentResearch?.status === 'PLAN_APPROVED' || currentResearch?.status === 'COMPLETED');
  const isDocumentsUploaded = Boolean(documents && documents.length > 0);
  const isEvidenceRetrieved = Boolean(evidences && evidences.length > 0);
  const isBriefGenerated = Boolean(currentBrief?._id);
  const isBriefReviewed = Boolean(currentBrief?.reviewStatus === 'APPROVED');

  const resId = currentResearch?._id;

  return {
    steps: [
      {
        key: 'details',
        number: 1,
        title: '1. Research Question',
        shortLabel: '1. Research',
        path: resId ? `/details/${resId}` : '/new',
        completed: isResearchCreated && isPlanApproved,
        locked: false,
        requiresLabel: ''
      },
      {
        key: 'documents',
        number: 2,
        title: '2. Upload Documents',
        shortLabel: '2. Documents',
        path: resId ? `/documents/${resId}` : '/new',
        completed: isDocumentsUploaded,
        locked: !isPlanApproved,
        requiresLabel: 'Approve AI Research Plan',
        redirectPath: resId ? `/details/${resId}` : '/new',
        redirectLabel: 'Go to Research Plan Approval',
        checklist: [
          { label: 'Research Question & Context', completed: isResearchCreated },
          { label: 'AI Research Plan Approved', completed: isPlanApproved },
          { label: 'Upload Source Documents', completed: isDocumentsUploaded }
        ],
        missingReason: 'You must approve the AI Research Plan before uploading source documents.'
      },
      {
        key: 'evidence',
        number: 3,
        title: '3. Evidence Retrieval',
        shortLabel: '3. Evidence',
        path: resId ? `/evidence/${resId}` : '/new',
        completed: isEvidenceRetrieved,
        locked: !isDocumentsUploaded,
        requiresLabel: 'Upload Source Documents',
        redirectPath: resId ? `/documents/${resId}` : '/new',
        redirectLabel: 'Go to Document Upload',
        checklist: [
          { label: 'Approved Research Plan', completed: isPlanApproved },
          { label: 'Upload Source Documents', completed: isDocumentsUploaded },
          { label: 'Retrieve Evidence Chunks', completed: isEvidenceRetrieved }
        ],
        missingReason: 'You must upload and process documents before retrieving evidence.'
      },
      {
        key: 'brief',
        number: 4,
        title: '4. Research Brief',
        shortLabel: '4. Brief',
        path: resId ? `/brief/${resId}` : '/new',
        completed: isBriefGenerated,
        locked: !isEvidenceRetrieved,
        requiresLabel: 'Retrieve Evidence',
        redirectPath: resId ? `/evidence/${resId}` : '/new',
        redirectLabel: 'Go to Evidence Retrieval',
        checklist: [
          { label: 'Upload Source Documents', completed: isDocumentsUploaded },
          { label: 'Retrieve & Classify Evidence', completed: isEvidenceRetrieved },
          { label: 'Synthesize Research Brief', completed: isBriefGenerated }
        ],
        missingReason: 'You must retrieve evidence before generating the Research Brief.'
      },
      {
        key: 'chat',
        number: 5,
        title: '5. AI RAG Chat',
        shortLabel: '5. RAG Chat',
        path: resId ? `/chat/${resId}` : '/new',
        completed: false,
        locked: !isBriefGenerated,
        requiresLabel: 'Generate Research Brief',
        redirectPath: resId ? `/brief/${resId}` : '/new',
        redirectLabel: 'Go to Research Brief Synthesis',
        checklist: [
          { label: 'Retrieve Empirical Evidence', completed: isEvidenceRetrieved },
          { label: 'Generate & Synthesize Research Brief', completed: isBriefGenerated },
          { label: 'Start Grounded RAG Conversation', completed: false }
        ],
        missingReason: 'Generate and review the Research Brief before starting evidence-grounded conversations.'
      }
    ],

    isPlanApproved,
    isDocumentsUploaded,
    isEvidenceRetrieved,
    isBriefGenerated,
    isBriefReviewed
  };
};
