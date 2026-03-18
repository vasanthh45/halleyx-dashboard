<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Customer Orders</h2>
        <p class="page-subtitle">View and manage customer orders and details</p>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:13px; color:#6b7280;">Show data for</span>
        <select v-model="dateRange" class="form-input filter-select" @change="loadAllData">
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
        <button class="btn-configure" @click="$router.push('/dashboard-config')">
          ⚙ Configure dashboard
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="dashboard-tabs">
      <button class="dash-tab" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
        📊 Dashboard
      </button>
      <button class="dash-tab" :class="{ active: activeTab === 'table' }" @click="activeTab = 'table'">
        📋 Table
      </button>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'">
      <div class="kpi-cards-row">
        <div class="kpi-card">
          <div class="kpi-card-label">Total Orders</div>
          <div class="kpi-card-value">{{ stats.totalOrders }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Total Revenue</div>
          <div class="kpi-card-value">${{ stats.totalRevenue }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Total Customers</div>
          <div class="kpi-card-value">{{ stats.totalCustomers }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-label">Total Sold Quantity</div>
          <div class="kpi-card-value">{{ stats.totalQuantity }}</div>
        </div>
      </div>

      <div v-if="widgets.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No widgets configured</h3>
        <p>Click Configure Dashboard to get started</p>
      </div>

      <div v-else class="widgets-grid">
        <div
          v-for="widget in widgets"
          :key="widget.id"
          class="widget-card"
          :style="{ gridColumn: 'span ' + widget.width }"
        >
          <div class="widget-card-header">
            <span class="widget-card-title">{{ widget.title }}</span>
            <span class="widget-type-badge">{{ getWidgetLabel(widget.type) }}</span>
          </div>

          <div v-if="widget.type === 'kpi'" class="widget-preview kpi-widget">
            <div class="kpi-value">
              <span v-if="widget.format === 'Currency'">$</span>
              {{ widgetData[widget.id] || '--' }}
            </div>
            <div class="kpi-label">{{ formatMetricLabel(widget.metric) }}</div>
          </div>

          <div v-else-if="['bar','line','area','scatter'].includes(widget.type)"
            class="widget-preview chart-widget">
            <canvas :id="'chart-' + widget.id" style="height:160px; max-height:160px; width:100%"></canvas>
          </div>

          <div v-else-if="widget.type === 'pie'" class="widget-preview chart-widget">
            <canvas :id="'chart-' + widget.id" style="height:160px; max-height:160px; width:100%"></canvas>
          </div>

          <div v-else-if="widget.type === 'table'" class="widget-preview table-widget">
            <div class="mini-table-wrap">
              <table class="mini-table" :style="{ fontSize: (widget.fontSize || 14) + 'px' }">
                <thead>
                  <tr :style="{ background: widget.headerBg || '#54bd95' }">
                    <th v-for="col in getTableColumns(widget)" :key="col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in getTableRows(widget)" :key="i">
                    <td v-for="col in getTableColumnKeys(widget)" :key="col">{{ row[col] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Table Tab -->
    <div v-if="activeTab === 'table'">

      <!-- Table Header -->
      <div class="table-toolbar">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="Search orders..." class="search-input"/>
        </div>
        <button class="btn-primary" @click="openCreateModal">+ Create order</button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No orders yet</h3>
        <p>Click Create order to add your first order</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="table-container">
  <table>
    <thead>
      <tr>
        <th>S.no</th>
        <th>Customer ID</th>
        <th>Customer name</th>
        <th>Email id</th>
        <th>Phone number</th>
        <th>Address</th>
        <th>Order ID</th>
        <th>Order date</th>
        <th>Product</th>
        <th>Quantity</th>
        <th>Unit price</th>
        <th>Total amount</th>
        <th>Status</th>
        <th>Created by</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(order, index) in filteredOrders" :key="order.id">
        <td>{{ index + 1 }}</td>
        <td>{{ order.customer_id }}</td>
        <td>{{ order.first_name }} {{ order.last_name }}</td>
        <td>{{ order.email }}</td>
        <td>{{ order.phone }}</td>
        <td>{{ order.street_address }}, {{ order.city }}, {{ order.state }}</td>
        <td>{{ order.order_id }}</td>
        <td>{{ formatDate(order.order_date || order.created_at) }}</td>
        <td>{{ order.product }}</td>
        <td>{{ order.quantity }}</td>
        <td>${{ order.unit_price }}</td>
        <td>${{ order.total_amount }}</td>
        <td>
          <span class="badge" :class="{
            'badge-pending': order.status === 'Pending',
            'badge-inprogress': order.status === 'In Progress',
            'badge-completed': order.status === 'Completed'
          }">{{ order.status }}</span>
        </td>
        <td>{{ order.created_by }}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" @click="openEditModal(order)">Edit</button>
            <button class="btn-danger" @click="confirmDelete(order)">Delete</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>

    <!-- Toast -->
    <div v-if="showToast" class="toast">
      <span class="toast-icon">✓</span>
      {{ toastMessage }}
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Order' : 'Create order' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="form-grid">
          <div class="form-section-title">Customer Information</div>
          <div class="form-group">
            <label class="form-label">First Name <span>*</span></label>
            <input v-model="form.first_name" class="form-input" :class="{ error: errors.first_name }" type="text" placeholder="First name"/>
            <span v-if="errors.first_name" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span>*</span></label>
            <input v-model="form.last_name" class="form-input" :class="{ error: errors.last_name }" type="text" placeholder="Last name"/>
            <span v-if="errors.last_name" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Email ID <span>*</span></label>
            <input v-model="form.email" class="form-input" :class="{ error: errors.email }" type="text" placeholder="Email address"/>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number <span>*</span></label>
            <input v-model="form.phone" class="form-input" :class="{ error: errors.phone }" type="text" placeholder="Phone number"/>
            <span v-if="errors.phone" class="error-message">This field is required</span>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Street Address <span>*</span></label>
            <input v-model="form.street_address" class="form-input" :class="{ error: errors.street_address }" type="text" placeholder="Street address"/>
            <span v-if="errors.street_address" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">City <span>*</span></label>
            <input v-model="form.city" class="form-input" :class="{ error: errors.city }" type="text" placeholder="City"/>
            <span v-if="errors.city" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">State / Province <span>*</span></label>
            <input v-model="form.state" class="form-input" :class="{ error: errors.state }" type="text" placeholder="State"/>
            <span v-if="errors.state" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Postal Code <span>*</span></label>
            <input v-model="form.postal_code" class="form-input" :class="{ error: errors.postal_code }" type="text" placeholder="Postal code"/>
            <span v-if="errors.postal_code" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Country <span>*</span></label>
            <select v-model="form.country" class="form-input" :class="{ error: errors.country }">
              <option value="">Select country</option>
              <option>United States</option>
              <option>Canada</option>
              <option>Australia</option>
              <option>Singapore</option>
              <option>Hong Kong</option>
            </select>
            <span v-if="errors.country" class="error-message">This field is required</span>
          </div>
          <div class="form-section-title">Order Information</div>
          <div class="form-group full-width">
            <label class="form-label">Choose Product <span>*</span></label>
            <select v-model="form.product" class="form-input" :class="{ error: errors.product }">
              <option value="">Select product</option>
              <option>Fiber Internet 300 Mbps</option>
              <option>5G Unlimited Mobile Plan</option>
              <option>Fiber Internet 1 Gbps</option>
              <option>Business Internet 500 Mbps</option>
              <option>VoIP Corporate Package</option>
            </select>
            <span v-if="errors.product" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity <span>*</span></label>
            <input v-model.number="form.quantity" class="form-input" :class="{ error: errors.quantity }" type="number" min="1" @input="calculateTotal"/>
            <span v-if="errors.quantity" class="error-message">Quantity must be at least 1</span>
          </div>
          <div class="form-group">
            <label class="form-label">Unit Price <span>*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input v-model.number="form.unit_price" class="form-input with-prefix" type="number" min="0" placeholder="0.00" @input="calculateTotal"/>
            </div>
            <span v-if="errors.unit_price" class="error-message">This field is required</span>
          </div>
          <div class="form-group">
            <label class="form-label">Total Amount</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input :value="form.total_amount" class="form-input with-prefix readonly" type="number" readonly/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status <span>*</span></label>
            <select v-model="form.status" class="form-input">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Created By <span>*</span></label>
            <select v-model="form.created_by" class="form-input" :class="{ error: errors.created_by }">
              <option value="">Select person</option>
              <option>Mr. Michael Harris</option>
              <option>Mr. Ryan Cooper</option>
              <option>Ms. Olivia Carter</option>
              <option>Mr. Lucas Martin</option>
            </select>
            <span v-if="errors.created_by" class="error-message">This field is required</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn-primary" @click="submitForm">{{ isEditing ? 'Update' : 'Submit' }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          <h3>Delete Order</h3>
          <button class="modal-close" @click="showDeleteConfirm = false">×</button>
        </div>
        <p style="color:#6b7280;font-size:14px;margin-bottom:24px">
          Are you sure you want to delete this order? This action cannot be undone.
        </p>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-danger-solid" @click="deleteOrderConfirmed">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getDashboard, getOrders, createOrder, updateOrder, deleteOrder } from '../services/api.js'
import axios from 'axios'
import Chart from 'chart.js/auto'

export default {
  name: 'Dashboard',
  data() {
    return {
      activeTab: 'dashboard',
      widgets: [],
      widgetData: {},
      tableData: {},
      orders: [],
      searchQuery: '',
      dateRange: '30days',
      charts: {},
      stats: {
        totalOrders: 0,
        totalRevenue: '0.00',
        totalCustomers: 0,
        totalQuantity: 0
      },
      showModal: false,
      showDeleteConfirm: false,
      showToast: false,
      toastMessage: '',
      isEditing: false,
      selectedOrder: null,
      form: {
        first_name: '', last_name: '', email: '', phone: '',
        street_address: '', city: '', state: '', postal_code: '',
        country: '', product: '', quantity: 1, unit_price: 0,
        total_amount: 0, status: 'Pending', created_by: ''
      },
      errors: {}
    }
  },
  computed: {
    filteredOrders() {
      if (!this.searchQuery) return this.orders
      const q = this.searchQuery.toLowerCase()
      return this.orders.filter(o =>
        (o.first_name + ' ' + o.last_name).toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        (o.customer_id && o.customer_id.toLowerCase().includes(q))
      )
    }
  },
  mounted() {
    this.loadAllData()
  },
  beforeUnmount() {
    Object.values(this.charts).forEach(chart => chart.destroy())
  },
  methods: {

    getWidgetLabel(type) {
      const labels = {
        bar: 'Bar Chart', line: 'Line Chart', pie: 'Pie Chart',
        area: 'Area Chart', scatter: 'Scatter Plot', table: 'Table', kpi: 'KPI'
      }
      return labels[type] || type
    },
    formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
},

    async loadAllData() {
      await Promise.all([
        this.loadDashboard(),
        this.loadStats(),
        this.loadOrders()
      ])
    },

    async loadStats() {
      try {
        const params = { dateRange: this.dateRange }
        const [ordersRes, revenueRes, quantityRes] = await Promise.all([
          axios.get('http://localhost:3000/api/widget-data', {
            params: { type: 'kpi', metric: 'total_amount', aggregation: 'Count', ...params }
          }),
          axios.get('http://localhost:3000/api/widget-data', {
            params: { type: 'kpi', metric: 'total_amount', aggregation: 'Sum', ...params }
          }),
          axios.get('http://localhost:3000/api/widget-data', {
            params: { type: 'kpi', metric: 'quantity', aggregation: 'Sum', ...params }
          })
        ])
        this.stats.totalOrders = parseInt(ordersRes.data.value) || 0
        this.stats.totalRevenue = parseFloat(revenueRes.data.value).toFixed(2) || '0.00'
        this.stats.totalCustomers = parseInt(ordersRes.data.value) || 0
        this.stats.totalQuantity = parseInt(quantityRes.data.value) || 0
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },

    async loadOrders() {
      try {
        const response = await getOrders(this.dateRange)
        this.orders = response.data.data
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    },

    async loadDashboard() {
      try {
        const response = await getDashboard()
        if (response.data.data && response.data.data.layout_json) {
          this.widgets = response.data.data.layout_json
          await this.loadWidgetData()
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      }
    },

    async loadWidgetData() {
      Object.values(this.charts).forEach(chart => chart.destroy())
      this.charts = {}
      for (const widget of this.widgets) {
        try {
          if (widget.type === 'kpi' && widget.metric) {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: { type: 'kpi', metric: widget.metric, aggregation: widget.aggregation, dateRange: this.dateRange }
            })
            this.widgetData[widget.id] = res.data.value
          }
          if (['bar','line','area','scatter'].includes(widget.type) && widget.xAxis && widget.yAxis) {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: { type: widget.type, xAxis: widget.xAxis, yAxis: widget.yAxis, dateRange: this.dateRange }
            })
            await this.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 100))
            this.renderChart(widget, res.data.data)
          }
          if (widget.type === 'pie' && widget.chartData) {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: { type: 'pie', chartData: widget.chartData, dateRange: this.dateRange }
            })
            await this.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 100))
            this.renderPieChart(widget, res.data.data)
          }
          if (widget.type === 'table') {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: { type: 'table', dateRange: this.dateRange }
            })
            this.tableData[widget.id] = res.data.data
          }
        } catch (error) {
          console.error('Error loading widget data:', error)
        }
      }
    },

    renderChart(widget, data) {
      const canvas = document.getElementById('chart-' + widget.id)
      if (!canvas || !data || data.length === 0) return
      if (this.charts[widget.id]) this.charts[widget.id].destroy()
      const labels = data.map(d => { const l = d.label || ''; return l.length > 10 ? l.substring(0, 10) + '..' : l })
      const values = data.map(d => parseFloat(d.value) || 0)
      const color = widget.color || '#0d9488'
      const typeMap = { bar: 'bar', line: 'line', area: 'line', scatter: 'scatter' }
      this.charts[widget.id] = new Chart(canvas, {
        type: typeMap[widget.type] || 'bar',
        data: {
          labels,
          datasets: [{
            label: widget.title,
            data: widget.type === 'scatter' ? values.map((v, i) => ({ x: i, y: v })) : values,
            backgroundColor: color + '99',
            borderColor: color,
            borderWidth: 2,
            fill: widget.type === 'area',
            tension: 0.4,
            borderRadius: widget.type === 'bar' ? 4 : 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { font: { size: 10 }, maxRotation: 0, minRotation: 0 }, grid: { display: false } },
            y: { ticks: { font: { size: 10 } }, grid: { color: '#f3f4f6' } }
          }
        }
      })
    },

    renderPieChart(widget, data) {
      const canvas = document.getElementById('chart-' + widget.id)
      if (!canvas || !data || data.length === 0) return
      if (this.charts[widget.id]) this.charts[widget.id].destroy()
      const labels = data.map(d => d.label || '')
      const values = data.map(d => parseFloat(d.value) || 0)
      const colors = ['#0d9488','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#10b981']
      this.charts[widget.id] = new Chart(canvas, {
        type: 'pie',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 8 } }
          }
        }
      })
    },

    formatMetricLabel(metric) {
      const labels = { total_amount: 'Total Amount', unit_price: 'Unit Price', quantity: 'Quantity', first_name: 'Customer Name', status: 'Status', product: 'Product', created_by: 'Created By' }
      return labels[metric] || metric || 'Select metric'
    },

    getTableColumns(widget) {
      if (!widget.columns || widget.columns.length === 0) return []
      const labels = { customer_id: 'Customer ID', customer_name: 'Customer name', email: 'Email', phone: 'Phone', address: 'Address', order_id: 'Order ID', order_date: 'Order date', product: 'Product', quantity: 'Quantity', unit_price: 'Unit price', total_amount: 'Total amount', status: 'Status', created_by: 'Created by' }
      return widget.columns.map(c => labels[c] || c)
    },

    getTableColumnKeys(widget) { return widget.columns || [] },

    getTableRows(widget) {
      const data = this.tableData[widget.id] || []
      const limit = parseInt(widget.pagination) || 10
      return data.slice(0, limit).map(row => ({
        ...row,
        customer_name: (row.first_name || '') + ' ' + (row.last_name || ''),
        address: (row.street_address || '') + ', ' + (row.city || '') + ', ' + (row.state || ''),
        order_date: row.order_date ? new Date(row.order_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''
      }))
    },

    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      setTimeout(() => { this.showToast = false }, 3000)
    },

    openCreateModal() {
      this.isEditing = false
      this.resetForm()
      this.showModal = true
    },

    openEditModal(order) {
      this.isEditing = true
      this.selectedOrder = order
      this.form = { ...order, filters: [] }
      this.errors = {}
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        first_name: '', last_name: '', email: '', phone: '',
        street_address: '', city: '', state: '', postal_code: '',
        country: '', product: '', quantity: 1, unit_price: 0,
        total_amount: 0, status: 'Pending', created_by: ''
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
      const required = ['first_name','last_name','phone','street_address','city','state','postal_code','country','product','created_by']
      required.forEach(field => { if (!this.form[field]) this.errors[field] = true })
      if (!this.form.email) {
        this.errors.email = 'This field is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'Enter a valid email address'
      }
      if (!this.form.quantity || this.form.quantity < 1) this.errors.quantity = true
      return Object.keys(this.errors).length === 0
    },

    async submitForm() {
      if (!this.validateForm()) return
      try {
        if (this.isEditing) {
          await updateOrder(this.selectedOrder.id, this.form)
          this.showSuccessToast('Order updated successfully')
        } else {
          await createOrder(this.form)
          this.showSuccessToast('Order created successfully')
        }
        await this.loadOrders()
        this.closeModal()
      } catch (error) {
        console.error('Error saving order:', error)
      }
    },

    confirmDelete(order) {
      this.selectedOrder = order
      this.showDeleteConfirm = true
    },

    async deleteOrderConfirmed() {
      try {
        await deleteOrder(this.selectedOrder.id)
        await this.loadOrders()
        this.showDeleteConfirm = false
        this.showSuccessToast('Order deleted successfully')
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }
}
</script>