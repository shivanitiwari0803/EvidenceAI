import api from '../services/api';

export const searchApi = {
  globalSearch: async (q, type = 'all') => {
    return await api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`);
  }
};

export default searchApi;
