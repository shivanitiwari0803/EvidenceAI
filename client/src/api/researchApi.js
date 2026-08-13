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
  },
  duplicateProject: async (id) => {
    return await api.post(`/research/${id}/duplicate`);
},
toggleArchive: async (id, isArchived) => {
    return await api.put(`/research/${id}/archive`, { isArchived });
},
deleteProject: async (id) => {
    return await api.delete(`/research/${id}`);
},
};

export default researchApi;
