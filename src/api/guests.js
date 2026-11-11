import { apiRequest } from './client.js'

export function getGuests() {
  return apiRequest('/api/guests')
}

export function createGuest(guest) {
  return apiRequest('/api/guests', {
    method: 'POST',
    body: JSON.stringify(guest)
  })
}

export function deleteGuest(id) {
  return apiRequest(`/api/guests/${id}`, { method: 'DELETE' })
}
