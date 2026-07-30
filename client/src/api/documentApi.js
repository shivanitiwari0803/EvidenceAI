import api from '../services/api';

export const documentApi = {
  uploadFile: async (formData) => {
    return await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  uploadText: async (data) => {
    return await api.post('/documents/upload', data);
  },

  processDocument: async (documentId) => {
    return await api.post('/documents/process', { documentId });
  },

  getDocuments: async (researchId) => {
    return await api.get(`/documents/${researchId}`);
  },

  deleteDocument: async (id) => {
    return await api.delete(`/documents/${id}`);
  }
};

export default documentApi;
