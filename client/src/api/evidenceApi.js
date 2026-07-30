import api from '../services/api';

export const evidenceApi = {
  retrieveEvidence: async (researchId) => {
    return await api.post('/evidence/retrieve', { researchId });
  },

  getEvidence: async (researchId) => {
    return await api.get(`/evidence/${researchId}`);
  }
};

export default evidenceApi;
