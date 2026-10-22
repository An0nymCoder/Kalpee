import api from './api'

export const tirelireService = {
  async getTirelire() {
    const { data } = await api.get('/tirelire')
    return data
  },

  async deposer(payload) {
    const cleanPayload = {
      montant: Number(payload.montant),
      motif: payload.motif,
      objectifId: payload.objectifId ? Number(payload.objectifId) : null,
    }
    const { data } = await api.post('/tirelire/depot', cleanPayload)
    return data
  },

  async retirer(payload) {
    const cleanPayload = {
      montant: Number(payload.montant),
      motif: payload.motif,
      objectifId: payload.objectifId ? Number(payload.objectifId) : null,
      articleId: payload.articleId ? Number(payload.articleId) : null,
    }
    const { data } = await api.post('/tirelire/retrait', cleanPayload)
    return data
  },

  async getTransactions(page = 0, size = 20) {
    const { data } = await api.get('/tirelire/transactions', {
      params: { page, size },
    })
    return data
  },
}
