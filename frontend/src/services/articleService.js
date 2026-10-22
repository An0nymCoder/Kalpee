import api from './api'

export const articleService = {
  async listByAchat(achatId) {
    const { data } = await api.get(`/achats/${achatId}/articles`)
    return data
  },

  async create(achatId, payload) {
    const { data } = await api.post(`/achats/${achatId}/articles`, payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.put(`/articles/${id}`, payload)
    return data
  },

  async updateStatut(id, statut) {
    const { data } = await api.patch(`/articles/${id}/statut`, { statut })
    return data
  },

  async remove(id) {
    await api.delete(`/articles/${id}`)
  },

  async uploadPhoto(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/articles/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async deletePhoto(id) {
    await api.delete(`/articles/${id}/photo`)
  },
}
