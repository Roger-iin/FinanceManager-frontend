import api from './api'

export const subscriptionService = {
    findAll: (includeInactive = false) => api.get('/subscriptions', {
        params: includeInactive ? { all: true } : {}
    }),

    findById: (id) => api.get(`/subscriptions/${id}`),

    create: (data) => api.post('/subscriptions', data),

    update: (id, data) => api.put(`/subscriptions/${id}`, data),

    cancel: (id) => api.patch(`/subscriptions/${id}/cancel`),

    reactivate: (id) => api.patch(`/subscriptions/${id}/reactivate`),

    delete: (id) => api.delete(`/subscriptions/${id}`),
}