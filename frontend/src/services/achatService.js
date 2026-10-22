import api from './api'

export const achatService = {
  async list({ recherche = '', priorite = '' } = {}) {
    const params = {}
    if (recherche && recherche.trim()) params.recherche = recherche.trim()
    if (priorite && priorite !== 'TOUS') params.priorite = priorite
    const { data } = await api.get('/achats', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/achats/${id}`)
    return data
  },

  async create(payload) {
    const cleanPayload = {
      ...payload,
      dateLimite: payload.dateLimite ? payload.dateLimite : null,
    }
    const { data } = await api.post('/achats', cleanPayload)
    return data
  },

  async update(id, payload) {
    const cleanPayload = {
      ...payload,
      dateLimite: payload.dateLimite ? payload.dateLimite : null,
    }
    const { data } = await api.put(`/achats/${id}`, cleanPayload)
    return data
  },

  async remove(id) {
    await api.delete(`/achats/${id}`)
  },
}
