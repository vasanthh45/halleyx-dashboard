import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Orders API calls
export const getOrders = (dateRange) => {
  return api.get('/orders', { params: { dateRange } })
}

export const createOrder = (orderData) => {
  return api.post('/orders', orderData)
}

export const updateOrder = (id, orderData) => {
  return api.put('/orders/' + id, orderData)
}

export const deleteOrder = (id) => {
  return api.delete('/orders/' + id)
}

// Dashboard API calls
export const getDashboard = () => {
  return api.get('/dashboard')
}

export const saveDashboard = (config) => {
  return api.post('/dashboard', config)
}

export default api