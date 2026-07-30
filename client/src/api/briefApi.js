import api from '../services/api';

export const briefApi = {
  generateBrief: async (researchId) => {
    return await api.post('/research-brief/generate', { researchId });
  },

  getBrief: async (researchId) => {
    return await api.get(`/research-brief/${researchId}`);
  },

  getBriefVersion: async (versionId) => {
    return await api.get(`/research-brief/version/${versionId}`);
  },

  getBriefVersions: async (researchId) => {
    return await api.get(`/research-brief/versions/${researchId}`);
  },

  regenerateBrief: async (researchId) => {
    return await api.post('/research-brief/regenerate', { researchId });
  },

  exportPdf: async (briefId) => {
    return await api.post('/research-brief/export/pdf', { briefId }, { responseType: 'blob' });
  },

  exportMarkdown: async (briefId) => {
    return await api.post('/research-brief/export/markdown', { briefId });
  }
};

export default briefApi;
