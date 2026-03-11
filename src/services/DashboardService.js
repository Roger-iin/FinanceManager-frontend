import api from './api'

export const dashboardService = {
    getSummary: (filters = {}) => api.get('/dashboard', { params: filters }),
}