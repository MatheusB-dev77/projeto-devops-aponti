import api from './api';

const orderService = {
  async getAll(params = {}) {
    const { data } = await api.get('/orders', { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/orders', payload);
    return data.data;
  },

  async updateStatus(id, status) {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data.data;
  },
};

export default orderService;
