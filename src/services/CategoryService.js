import api from './api'

export const categoryService = {
    findAll: (type) => api.get('/categories', {
        params: type ? { type } : {}
    }),

    create: (data) => api.post('/categories', data),

    update: (id, data) => api.put(`/categories/${id}`, data),

    delete: (id) => api.delete(`/categories/${id}`),
}