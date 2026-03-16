<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Customer Orders</h2>
        <p class="page-subtitle">View and manage customer orders and details</p>
      </div>
      <div class="header-actions">
        <div class="tabs-inline">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'dashboard' }"
            @click="activeTab = 'dashboard'"
          >
            Dashboard
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'table' }"
            @click="activeTab = 'table'"
          >
            Table
          </button>
        </div>
        <div class="date-filter">
          <label class="filter-label">Show data for</label>
          <select v-model="dateRange" class="form-input filter-select" @change="loadAllData">
            <option value="">All time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        <button class="btn-primary" @click="$router.push('/dashboard-config')">
          Configure Dashboard
        </button>
      </div>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'">

      <!-- Fixed KPI Cards -->
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

      <!-- Empty State -->
      <div v-if="widgets.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No widgets configured</h3>
        <p>Click Configure Dashboard to get started</p>
      </div>

      <!-- Widgets Grid -->
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

          <!-- KPI Widget -->
          <div v-if="widget.type === 'kpi'" class="widget-preview kpi-widget">
            <div class="kpi-value">
              <span v-if="widget.format === 'Currency'">$</span>
              {{ widgetData[widget.id] || '--' }}
            </div>
            <div class="kpi-label">{{ formatMetricLabel(widget.metric) }}</div>
          </div>

          <!-- Chart Widget -->
          <div
            v-else-if="['bar','line','area','scatter'].includes(widget.type)"
            class="widget-preview chart-widget"
          >
            <canvas :id="'chart-' + widget.id" style="max-height: 250px"></canvas>
          </div>

          <!-- Pie Chart -->
          <div v-else-if="widget.type === 'pie'" class="widget-preview chart-widget">
            <canvas :id="'chart-' + widget.id" style="max-height: 250px"></canvas>
          </div>

          <!-- Table Widget -->
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
      <div v-if="orders.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No orders yet</h3>
        <p>Go to Customer Orders to add orders</p>
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Customer ID</th>
              <th>Customer name</th>
              <th>Email id</th>
              <th>Phone number</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit price</th>
              <th>Total amount</th>
              <th>Status</th>
              <th>Created by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in orders" :key="order.id">
              <td>{{ index + 1 }}</td>
              <td>{{ order.customer_id }}</td>
              <td>{{ order.first_name }} {{ order.last_name }}</td>
              <td>{{ order.email }}</td>
              <td>{{ order.phone }}</td>
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { getDashboard, getOrders } from '../services/api.js'
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
      dateRange: '30days',
      charts: {},
      stats: {
        totalOrders: 0,
        totalRevenue: '0.00',
        totalCustomers: 0,
        totalQuantity: 0
      }
    }
  },
  mounted() {
    this.loadAllData()
  },
  beforeUnmount() {
    Object.values(this.charts).forEach(chart => chart.destroy())
  },
  methods: {
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
},cd "C:\Users\Vasanth\OneDrive - Kamaraj College of Engineering and Technology\Desktop\halleyx-dashboard"
git add .
git commit -m "Dashboard matches Figma - KPI cards, tabs, all charts working"
git push
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
              params: {
                type: 'kpi',
                metric: widget.metric,
                aggregation: widget.aggregation,
                dateRange: this.dateRange
              }
            })
            this.widgetData[widget.id] = res.data.value
          }

          if (['bar','line','area','scatter'].includes(widget.type) && widget.xAxis && widget.yAxis) {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: {
                type: widget.type,
                xAxis: widget.xAxis,
                yAxis: widget.yAxis,
                dateRange: this.dateRange
              }
            })
            await this.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 100))
            this.renderChart(widget, res.data.data)
          }

          if (widget.type === 'pie' && widget.chartData) {
            const res = await axios.get('http://localhost:3000/api/widget-data', {
              params: {
                type: 'pie',
                chartData: widget.chartData,
                dateRange: this.dateRange
              }
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

      const labels = data.map(d => d.label || '')
      const values = data.map(d => parseFloat(d.value) || 0)
      const color = widget.color || '#0d9488'
      const typeMap = { bar: 'bar', line: 'line', area: 'line', scatter: 'scatter' }

      this.charts[widget.id] = new Chart(canvas, {
        type: typeMap[widget.type] || 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: widget.title,
            data: widget.type === 'scatter'
              ? values.map((v, i) => ({ x: i, y: v }))
              : values,
            backgroundColor: color + '99',
            borderColor: color,
            borderWidth: 2,
            fill: widget.type === 'area',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: widget.showDataLabel || false }
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
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors.slice(0, values.length),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: widget.showLegend || false }
          }
        }
      })
    },
    getWidgetLabel(type) {
      const labels = {
        bar: 'Bar Chart', line: 'Line Chart', pie: 'Pie Chart',
        area: 'Area Chart', scatter: 'Scatter Plot', table: 'Table', kpi: 'KPI'
      }
      return labels[type] || type
    },
    formatMetricLabel(metric) {
      const labels = {
        total_amount: 'Total Amount', unit_price: 'Unit Price',
        quantity: 'Quantity', first_name: 'Customer Name',
        status: 'Status', product: 'Product', created_by: 'Created By'
      }
      return labels[metric] || metric || 'Select metric'
    },
    getTableColumns(widget) {
      if (!widget.columns || widget.columns.length === 0) return []
      const labels = {
        customer_id: 'Customer ID', customer_name: 'Customer name',
        email: 'Email', phone: 'Phone', address: 'Address',
        order_id: 'Order ID', order_date: 'Order date',
        product: 'Product', quantity: 'Quantity',
        unit_price: 'Unit price', total_amount: 'Total amount',
        status: 'Status', created_by: 'Created by'
      }
      return widget.columns.map(c => labels[c] || c)
    },
    getTableColumnKeys(widget) {
      return widget.columns || []
    },
    getTableRows(widget) {
      const data = this.tableData[widget.id] || []
      const limit = parseInt(widget.pagination) || 10
      return data.slice(0, limit).map(row => ({
        ...row,
        customer_name: (row.first_name || '') + ' ' + (row.last_name || ''),
        address: (row.street_address || '') + ', ' + (row.city || '') + ', ' + (row.state || '')
      }))
    }
  }
}
</script>