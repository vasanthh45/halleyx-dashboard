<template>
  <div class="p-6">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Customer Orders</h2>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
      >
        + Create Order
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="orders.length === 0"
      class="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200"
    >
      <div class="text-gray-400 text-6xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
      <p class="text-sm text-gray-400 mb-6">Click Create Order to add your first order</p>
    </div>

    <!-- Orders Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Product</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Total</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Created By</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ order.first_name }} {{ order.last_name }}</td>
            <td class="px-4 py-3">{{ order.product }}</td>
            <td class="px-4 py-3">${{ order.total_amount }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-yellow-100 text-yellow-700': order.status === 'Pending',
                  'bg-blue-100 text-blue-700': order.status === 'In progress',
                  'bg-green-100 text-green-700': order.status === 'Completed'
                }"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="px-4 py-3">{{ order.created_by }}</td>
            <td class="px-4 py-3">
              <button
                @click="editOrder(order)"
                class="text-teal-600 hover:text-teal-700 mr-3 text-xs font-medium"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(order)"
                class="text-red-500 hover:text-red-600 text-xs font-medium"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import { getOrders } from '../services/api.js'

export default {
  name: 'Orders',
  data() {
    return {
      orders: [],
      showCreateModal: false
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await getOrders()
        this.orders = response.data.data
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    },
    editOrder(order) {
      console.log('Edit order:', order)
    },
    confirmDelete(order) {
      console.log('Delete order:', order)
    }
  }
}
</script>