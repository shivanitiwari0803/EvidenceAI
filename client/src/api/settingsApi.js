import api from '../services/api';

export const settingsApi = {
  getSettings: async () => {
    return await api.get('/settings');
  },

  updateSettings: async (data) => {
    return await api.put('/settings', data);
  }
};

export default settingsApi;
