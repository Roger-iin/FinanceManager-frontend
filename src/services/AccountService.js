import api from './api'

export const accountService = {
    findAll: () => api.get('/accounts'),

    findById: (id) => api.get(`/accounts/${id}`),

    create: (data) => api.post('/accounts', data),

    update: (id, data) => api.put(`/accounts/${id}`, data),

    delete: (id) => api.delete(`/accounts/${id}`),
}