import api from './api'

export const objectifService = {
  async list() {
    const { data } = await api.get('/objectifs')
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/objectifs/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/objectifs', {
      ...payload,
      montantCible: Number(payload.montantCible),
      montantInitial: Number(payload.montantInitial || 0),
    })
    return data
  },

  async update(id, payload) {
    const { data } = await api.put(`/objectifs/${id}`, {
      ...payload,
      montantCible: Number(payload.montantCible),
      montantInitial: Number(payload.montantInitial || 0),
    })
    return data
  },

  async remove(id) {
    await api.delete(`/objectifs/${id}`)
  },
}
