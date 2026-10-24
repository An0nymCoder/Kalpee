import api from './api'

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export async function updateUser(userId, payload) {
  const { data } = await api.put(`/admin/utilisateurs/${userId}`, payload)
  return data
}

export async function updateUserRole(userId, role) {
  const { data } = await api.patch(`/admin/utilisateurs/${userId}/role`, { role })
  return data
}

export async function deleteUser(userId) {
  await api.delete(`/admin/utilisateurs/${userId}`)
}
