import api from '../services/api';

export const chatApi = {
  sendMessage: async (researchId, message) => {
    return await api.post('/chat/message', { researchId, message });
  },

  getHistory: async (researchId) => {
    return await api.get(`/chat/${researchId}`);
  },

  clearHistory: async (researchId) => {
    return await api.delete(`/chat/${researchId}`);
  }
};

export default chatApi;
