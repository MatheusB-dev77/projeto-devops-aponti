import api from './api';

const productService = {
  async getAll(params = {}) {
    const { data } = await api.get('/products', { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getById(id) {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/products', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.data;
  },

  async delete(id) {
    await api.delete(`/products/${id}`);
  },
};

export default productService;
