import api from './api'

export const transactionService = {
    findAll: (filters = {}) => api.get('/transactions', { params: filters }),

    findById: (id) => api.get(`/transactions/${id}`),

    create: (data) => api.post('/transactions', data),

    update: (id, data) => api.put(`/transactions/${id}`, data),

    delete: (id) => api.delete(`/transactions/${id}`),
}