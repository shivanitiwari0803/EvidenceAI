import api from '../services/api';

export const researchApi = {
  createResearch: async (data) => {
    return await api.post('/research', data);
  },

  getResearchById: async (id) => {
    return await api.get(`/research/${id}`);
  },

  updateResearch: async (id, data) => {
    return await api.put(`/research/${id}`, data);
  },

  getHistory: async () => {
    return await api.get('/history');
  }
};

export default researchApi;
