<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">Customer Orders</h2>
      <button class="btn-primary" @click="openCreateModal">
        + Create Order
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="orders.length === 0" class="empty-state">
      <div class="empty-state-icon">📋</div>
      <h3>No orders yet</h3>
      <p>Click Create Order to add your first order</p>
    </div>

    <!-- Orders Table -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.first_name }} {{ order.last_name }}</td>
            <td>{{ order.email }}</td>
            <td>{{ order.product }}</td>
            <td>{{ order.quantity }}</td>
            <td>${{ order.unit_price }}</td>
            <td>${{ order.total_amount }}</td>
            <td>
              <span class="badge" :class="{
                'badge-pending': order.status === 'Pending',
                'badge-inprogress': order.status === 'In progress',
                'badge-completed': order.status === 'Completed'
              }">{{ order.status }}</span>
            </td>
            <td>{{ order.created_by }}</td>
            <td>
              <button class="btn-edit" @click="openEditModal(order)">Edit</button>
              <button class="btn-danger" @click="confirmDelete(order)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Order Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">

        <!-- Modal Header -->
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Order' : 'Create Order' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <!-- Form -->
        <div class="form-grid">

          <!-- Customer Information Section -->
          <div class="form-section-title">Customer Information</div>

          <div class="form-group">
            <label class="form-label">First Name <span>*</span></label>
            <input
              v-model="form.first_name"
              class="form-input"
              :class="{ error: errors.first_name }"
              type="text"
              placeholder="Enter first name"
            />
            <span v-if="errors.first_name" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Last Name <span>*</span></label>
            <input
              v-model="form.last_name"
              class="form-input"
              :class="{ error: errors.last_name }"
              type="text"
              placeholder="Enter last name"
            />
            <span v-if="errors.last_name" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Email ID <span>*</span></label>
            <input
              v-model="form.email"
              class="form-input"
              :class="{ error: errors.email }"
              type="text"
              placeholder="Enter email"
            />
            <span v-if="errors.email" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number <span>*</span></label>
            <input
              v-model="form.phone"
              class="form-input"
              :class="{ error: errors.phone }"
              type="text"
              placeholder="Enter phone number"
            />
            <span v-if="errors.phone" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Street Address <span>*</span></label>
            <input
              v-model="form.street_address"
              class="form-input"
              :class="{ error: errors.street_address }"
              type="text"
              placeholder="Enter street address"
            />
            <span v-if="errors.street_address" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">City <span>*</span></label>
            <input
              v-model="form.city"
              class="form-input"
              :class="{ error: errors.city }"
              type="text"
              placeholder="Enter city"
            />
            <span v-if="errors.city" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">State / Province <span>*</span></label>
            <input
              v-model="form.state"
              class="form-input"
              :class="{ error: errors.state }"
              type="text"
              placeholder="Enter state"
            />
            <span v-if="errors.state" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Postal Code <span>*</span></label>
            <input
              v-model="form.postal_code"
              class="form-input"
              :class="{ error: errors.postal_code }"
              type="text"
              placeholder="Enter postal code"
            />
            <span v-if="errors.postal_code" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Country <span>*</span></label>
            <select
              v-model="form.country"
              class="form-input"
              :class="{ error: errors.country }"
            >
              <option value="">Select country</option>
              <option>United States</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>Singapore</option>
              <option>Hong Kong</option>
            </select>
            <span v-if="errors.country" class="error-message">Please fill the field</span>
          </div>

          <!-- Order Information Section -->
          <div class="form-section-title">Order Information</div>

          <div class="form-group full-width">
            <label class="form-label">Choose Product <span>*</span></label>
            <select
              v-model="form.product"
              class="form-input"
              :class="{ error: errors.product }"
            >
              <option value="">Select product</option>
              <option>Fiber Internet 300 Mbps</option>
              <option>5G Unlimited Mobile Plan</option>
              <option>Fiber Internet 1 Gbps</option>
              <option>Business Internet 500 Mbps</option>
              <option>VoIP Corporate Package</option>
            </select>
            <span v-if="errors.product" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Quantity <span>*</span></label>
            <input
              v-model.number="form.quantity"
              class="form-input"
              :class="{ error: errors.quantity }"
              type="number"
              min="1"
              @input="calculateTotal"
            />
            <span v-if="errors.quantity" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Unit Price <span>*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input
                v-model.number="form.unit_price"
                class="form-input with-prefix"
                :class="{ error: errors.unit_price }"
                type="number"
                min="0"
                placeholder="0.00"
                @input="calculateTotal"
              />
            </div>
            <span v-if="errors.unit_price" class="error-message">Please fill the field</span>
          </div>

          <div class="form-group">
            <label class="form-label">Total Amount</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input
                :value="form.total_amount"
                class="form-input with-prefix readonly"
                type="number"
                readonly
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Status <span>*</span></label>
            <select v-model="form.status" class="form-input">
              <option>Pending</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Created By <span>*</span></label>
            <select
              v-model="form.created_by"
              class="form-input"
              :class="{ error: errors.created_by }"
            >
              <option value="">Select person</option>
              <option>Mr. Michael Harris</option>
              <option>Mr. Ryan Cooper</option>
              <option>Ms. Olivia Carter</option>
              <option>Mr. Lucas Martin</option>
            </select>
            <span v-if="errors.created_by" class="error-message">Please fill the field</span>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn-primary" @click="submitForm">
            {{ isEditing ? 'Update Order' : 'Submit' }}
          </button>
        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal" style="max-width: 400px">
        <div class="modal-header">
          <h3>Delete Order</h3>
          <button class="modal-close" @click="showDeleteConfirm = false">×</button>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px">
          Are you sure you want to delete this order? This action cannot be undone.
        </p>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-danger-solid" @click="deleteOrder">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getOrders, createOrder, updateOrder, deleteOrder } from '../services/api.js'

export default {
  name: 'Orders',
  data() {
    return {
      orders: [],
      showModal: false,
      showDeleteConfirm: false,
      isEditing: false,
      selectedOrder: null,
      form: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        product: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        status: 'Pending',
        created_by: ''
      },
      errors: {}
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

    openCreateModal() {
      this.isEditing = false
      this.resetForm()
      this.showModal = true
    },

    openEditModal(order) {
      this.isEditing = true
      this.selectedOrder = order
      this.form = {
        first_name: order.first_name,
        last_name: order.last_name,
        email: order.email,
        phone: order.phone,
        street_address: order.street_address,
        city: order.city,
        state: order.state,
        postal_code: order.postal_code,
        country: order.country,
        product: order.product,
        quantity: order.quantity,
        unit_price: order.unit_price,
        total_amount: order.total_amount,
        status: order.status,
        created_by: order.created_by
      }
      this.errors = {}
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        product: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        status: 'Pending',
        created_by: ''
      }
      this.errors = {}
    },

    calculateTotal() {
      const qty = parseFloat(this.form.quantity) || 0
      const price = parseFloat(this.form.unit_price) || 0
      this.form.total_amount = (qty * price).toFixed(2)
    },

    validateForm() {
      this.errors = {}
      const required = [
        'first_name', 'last_name', 'email', 'phone',
        'street_address', 'city', 'state', 'postal_code',
        'country', 'product', 'created_by'
      ]
      required.forEach(field => {
        if (!this.form[field]) {
          this.errors[field] = true
        }
      })
      if (!this.form.quantity || this.form.quantity < 1) {
        this.errors.quantity = true
      }
      if (!this.form.unit_price || this.form.unit_price < 0) {
        this.errors.unit_price = true
      }
      return Object.keys(this.errors).length === 0
    },

    async submitForm() {
      if (!this.validateForm()) return
      try {
        if (this.isEditing) {
          await updateOrder(this.selectedOrder.id, this.form)
        } else {
          await createOrder(this.form)
        }
        await this.fetchOrders()
        this.closeModal()
      } catch (error) {
        console.error('Error saving order:', error)
      }
    },

    confirmDelete(order) {
      this.selectedOrder = order
      this.showDeleteConfirm = true
    },

    async deleteOrder() {
      try {
        await deleteOrder(this.selectedOrder.id)
        await this.fetchOrders()
        this.showDeleteConfirm = false
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }
}
</script>