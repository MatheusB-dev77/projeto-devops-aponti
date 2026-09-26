import api from './api';

const customerService = {
  async getAll(params = {}) {
    const { data } = await api.get('/customers', { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getById(id) {
    const { data } = await api.get(`/customers/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/customers', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/customers/${id}`, payload);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/customers/${id}`);
  },
};

export default customerService;
