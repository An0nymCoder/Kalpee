import api from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  async login(payload) {
    const { data } = await api.post('/auth/login', payload)
    return data
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async getProfil() {
    const { data } = await api.get('/profil')
    return data
  },

  async updateProfil(payload) {
    const { data } = await api.put('/profil', payload)
    return data
  },

  async updateMotDePasse(payload) {
    const { data } = await api.put('/profil/mot-de-passe', payload)
    return data
  },
}
