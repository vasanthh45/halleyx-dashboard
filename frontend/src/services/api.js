import axios from 'axios'

// Automatically switch between local and deployed backend
const BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://halleyx-backend-fo4i.onrender.com'

const api = axios.create({
  baseURL: `${BASE_URL}/api`
})

// Widget data API calls
export const getWidgetData = (params) => {
  return api.get('/widget-data', { params })
}

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