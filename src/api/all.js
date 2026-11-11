import { apiRequest } from './client.js'

export function getList(endpoint) {
  return apiRequest(endpoint)
}

export function createItem(endpoint, data) {
  return apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) })
}

export function updateItem(endpoint, id, data) {
  return apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteItem(endpoint, id) {
  return apiRequest(`${endpoint}/${id}`, { method: 'DELETE' })
}
