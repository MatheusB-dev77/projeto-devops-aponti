import api from './api';

const categoryService = {
  async getAll() {
    const { data } = await api.get('/categories');
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
