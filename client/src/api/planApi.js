import api from '../services/api';

export const planApi = {
  generatePlan: async (researchId) => {
    return await api.post('/plan/generate', { researchId });
  },

  updatePlan: async (planId, steps) => {
    return await api.put(`/plan/${planId}`, { steps });
  },

  approvePlan: async (planId) => {
    return await api.post(`/plan/${planId}/approve`);
  }
};

export default planApi;
