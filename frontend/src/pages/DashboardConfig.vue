<template>
  <div class="config-layout">

    <div class="config-header">
      <div>
        <h2 class="page-title">Configure Dashboard</h2>
        <p class="page-subtitle">Drag and drop widgets to build your dashboard</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="$router.push('/')">Cancel</button>
        <button class="btn-primary" @click="saveConfig">Save Configuration</button>
      </div>
    </div>

    <div class="config-body">

      <div class="widget-library">
        <p class="library-title">Widget library</p>

        <div class="library-section">
          <div class="library-section-header" @click="toggleSection('charts')">
            <span>Charts</span>
            <span>{{ openSections.charts ? '▾' : '▸' }}</span>
          </div>
          <div v-if="openSections.charts" class="library-items">
            <div class="library-item" @click="addWidget('bar')">
              <span class="widget-icon">📊</span>
              <span>Bar Chart</span>
            </div>
            <div class="library-item" @click="addWidget('line')">
              <span class="widget-icon">📈</span>
              <span>Line Chart</span>
            </div>
            <div class="library-item" @click="addWidget('pie')">
              <span class="widget-icon">🥧</span>
              <span>Pie Chart</span>
            </div>
            <div class="library-item" @click="addWidget('area')">
              <span class="widget-icon">📉</span>
              <span>Area Chart</span>
            </div>
            <div class="library-item" @click="addWidget('scatter')">
              <span class="widget-icon">✦</span>
              <span>Scatter Plot</span>
            </div>
          </div>
        </div>

        <div class="library-section">
          <div class="library-section-header" @click="toggleSection('tables')">
            <span>Tables</span>
            <span>{{ openSections.tables ? '▾' : '▸' }}</span>
          </div>
          <div v-if="openSections.tables" class="library-items">
            <div class="library-item" @click="addWidget('table')">
              <span class="widget-icon">📋</span>
              <span>Table</span>
            </div>
          </div>
        </div>

        <div class="library-section">
          <div class="library-section-header" @click="toggleSection('kpis')">
            <span>KPIs</span>
            <span>{{ openSections.kpis ? '▾' : '▸' }}</span>
          </div>
          <div v-if="openSections.kpis" class="library-items">
            <div class="library-item" @click="addWidget('kpi')">
              <span class="widget-icon">🔢</span>
              <span>KPI Value</span>
            </div>
          </div>
        </div>
      </div>

      <div class="canvas-area">

        <div v-if="widgets.length === 0" class="canvas-empty">
          <div class="canvas-empty-icon">📊</div>
          <p>Click widgets from the library to add them here</p>
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
              <div class="widget-card-actions">
                <button class="widget-action-btn" @click="openSettings(widget)">⚙</button>
                <button class="widget-action-btn delete" @click="removeWidget(widget.id)">✕</button>
              </div>
            </div>

            <div class="widget-preview">

              <!-- KPI Preview -->
              <div v-if="widget.type === 'kpi'" class="kpi-preview">
                <div class="kpi-value">--</div>
                <div class="kpi-label">{{ formatMetricLabel(widget.metric) }}</div>
              </div>

              <!-- Table Preview -->
              <div v-else-if="widget.type === 'table'" class="config-preview-box">
                <div class="config-preview-icon">📋</div>
                <div class="config-preview-text">Table Widget</div>
                <div class="config-preview-sub">Configure settings to set up</div>
              </div>

              <!-- Chart Preview with real mini chart -->
              <div v-else class="chart-container-preview">
                <canvas :id="'preview-' + widget.id"></canvas>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Settings Drawer -->
    <div v-if="showDrawer" class="drawer-overlay" @click.self="closeDrawer">
      <div class="drawer">

        <div class="drawer-header">
          <h3>Widget Settings</h3>
          <button class="modal-close" @click="closeDrawer">×</button>
        </div>

        <div class="drawer-body">

          <div class="form-group">
            <label class="form-label">Widget title</label>
            <input v-model="activeWidget.title" class="form-input" type="text"/>
          </div>

          <div class="form-group">
            <label class="form-label">Widget type</label>
            <input :value="getWidgetLabel(activeWidget.type)" class="form-input" readonly/>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="activeWidget.description" class="form-input" rows="2"></textarea>
          </div>

          <div class="drawer-section-title">Widget size</div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Width (Columns)</label>
              <input v-model.number="activeWidget.width" class="form-input" type="number" min="1" max="12"/>
            </div>
            <div class="form-group">
              <label class="form-label">Height (Rows)</label>
              <input v-model.number="activeWidget.height" class="form-input" type="number" min="1"/>
            </div>
          </div>

          <div class="drawer-section-title">Data setting</div>

          <template v-if="activeWidget.type === 'kpi'">
            <div class="form-group">
              <label class="form-label">Select metric</label>
              <select v-model="activeWidget.metric" class="form-input">
                <option value="">Select metric</option>
                <option value="total_amount">Total amount</option>
                <option value="unit_price">Unit price</option>
                <option value="quantity">Quantity</option>
                <option value="first_name">Customer name</option>
                <option value="status">Status</option>
                <option value="product">Product</option>
                <option value="created_by">Created by</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Aggregation</label>
              <select v-model="activeWidget.aggregation" class="form-input"
                :disabled="!isNumericField(activeWidget.metric)">
                <option>Sum</option>
                <option>Average</option>
                <option>Count</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Data format</label>
              <select v-model="activeWidget.format" class="form-input">
                <option>Number</option>
                <option>Currency</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Decimal Precision</label>
              <input v-model.number="activeWidget.precision" class="form-input" type="number" min="0"/>
            </div>
          </template>

          <template v-if="['bar','line','area','scatter'].includes(activeWidget.type)">
            <div class="form-group">
              <label class="form-label">X Axis data</label>
              <select v-model="activeWidget.xAxis" class="form-input">
                <option value="">Select X axis</option>
                <option value="product">Product</option>
                <option value="status">Status</option>
                <option value="created_by">Created by</option>
                <option value="quantity">Quantity</option>
                <option value="unit_price">Unit price</option>
                <option value="total_amount">Total amount</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Y Axis data</label>
              <select v-model="activeWidget.yAxis" class="form-input">
                <option value="">Select Y axis</option>
                <option value="total_amount">Total amount</option>
                <option value="quantity">Quantity</option>
                <option value="unit_price">Unit price</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Chart color</label>
              <div class="color-picker-wrap">
                <input type="color" v-model="activeWidget.color" class="color-input"/>
                <input type="text" v-model="activeWidget.color" class="form-input color-hex" placeholder="#000000"/>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label checkbox-label">
                <input type="checkbox" v-model="activeWidget.showDataLabel"/>
                Show data label
              </label>
            </div>
          </template>

          <template v-if="activeWidget.type === 'pie'">
            <div class="form-group">
              <label class="form-label">Choose chart data</label>
              <select v-model="activeWidget.chartData" class="form-input">
                <option value="">Select data</option>
                <option value="product">Product</option>
                <option value="status">Status</option>
                <option value="created_by">Created by</option>
                <option value="quantity">Quantity</option>
                <option value="total_amount">Total amount</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label checkbox-label">
                <input type="checkbox" v-model="activeWidget.showLegend"/>
                Show legend
              </label>
            </div>
          </template>

          <template v-if="activeWidget.type === 'table'">
            <div class="form-group">
              <label class="form-label">Choose columns</label>
              <div class="checkbox-list">
                <label v-for="col in tableColumns" :key="col.value" class="checkbox-item">
                  <input type="checkbox" :value="col.value" v-model="activeWidget.columns"/>
                  {{ col.label }}
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Sort by</label>
              <select v-model="activeWidget.sortBy" class="form-input">
                <option value="">None</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
                <option value="order_date">Order date</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Pagination</label>
              <select v-model="activeWidget.pagination" class="form-input">
                <option value="">None</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Font size</label>
              <input v-model.number="activeWidget.fontSize" class="form-input" type="number" min="12" max="18"/>
            </div>
            <div class="form-group">
              <label class="form-label">Header background</label>
              <div class="color-picker-wrap">
                <input type="color" v-model="activeWidget.headerBg" class="color-input"/>
                <input type="text" v-model="activeWidget.headerBg" class="form-input color-hex" placeholder="#54bd95"/>
              </div>
            </div>
          </template>

        </div>

        <div class="drawer-footer">
          <button class="btn-secondary" @click="closeDrawer">Cancel</button>
          <button class="btn-primary" @click="applySettings">Apply</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { saveDashboard, getDashboard } from '../services/api.js'
import Chart from 'chart.js/auto'

export default {
  name: 'DashboardConfig',
  data() {
    return {
      widgets: [],
      showDrawer: false,
      activeWidget: null,
      previewCharts: {},
      openSections: {
        charts: true,
        tables: true,
        kpis: true
      },
      tableColumns: [
        { label: 'Customer ID', value: 'customer_id' },
        { label: 'Customer name', value: 'customer_name' },
        { label: 'Email id', value: 'email' },
        { label: 'Phone number', value: 'phone' },
        { label: 'Address', value: 'address' },
        { label: 'Order ID', value: 'order_id' },
        { label: 'Order date', value: 'order_date' },
        { label: 'Product', value: 'product' },
        { label: 'Quantity', value: 'quantity' },
        { label: 'Unit price', value: 'unit_price' },
        { label: 'Total amount', value: 'total_amount' },
        { label: 'Status', value: 'status' },
        { label: 'Created by', value: 'created_by' }
      ]
    }
  },
  mounted() {
    this.loadExistingConfig()
  },
  beforeUnmount() {
    Object.values(this.previewCharts).forEach(c => c.destroy())
  },
  methods: {
    async loadExistingConfig() {
      try {
        const response = await getDashboard()
        if (response.data.data && response.data.data.layout_json) {
          this.widgets = response.data.data.layout_json
          await this.$nextTick()
          this.widgets.forEach(w => {
            if (!['kpi', 'table'].includes(w.type)) {
              this.renderPreviewChart(w)
            }
          })
        }
      } catch (error) {
        console.error('Error loading config:', error)
      }
    },
    toggleSection(section) {
      this.openSections[section] = !this.openSections[section]
    },
    getWidgetLabel(type) {
      const labels = {
        bar: 'Bar Chart', line: 'Line Chart', pie: 'Pie Chart',
        area: 'Area Chart', scatter: 'Scatter Plot', table: 'Table', kpi: 'KPI'
      }
      return labels[type] || type
    },
    getDefaultWidth(type) {
      if (type === 'kpi') return 2
      if (type === 'pie') return 4
      if (type === 'table') return 4
      return 5
    },
    getDefaultHeight(type) {
      if (type === 'kpi') return 2
      if (type === 'pie') return 4
      if (type === 'table') return 4
      return 5
    },
    async addWidget(type) {
      const widget = {
        id: Date.now(),
        type: type,
        title: 'Untitled',
        description: '',
        width: this.getDefaultWidth(type),
        height: this.getDefaultHeight(type),
        color: '#0d9488',
        headerBg: '#54bd95',
        fontSize: 14,
        columns: [],
        metric: '',
        aggregation: 'Sum',
        format: 'Number',
        precision: 0,
        xAxis: '',
        yAxis: '',
        chartData: '',
        showLegend: false,
        showDataLabel: false,
        sortBy: '',
        pagination: '10'
      }
      this.widgets.push(widget)
      if (!['kpi', 'table'].includes(type)) {
        await this.$nextTick()
        await new Promise(r => setTimeout(r, 100))
        this.renderPreviewChart(widget)
      }
    },
    removeWidget(id) {
      if (this.previewCharts[id]) {
        this.previewCharts[id].destroy()
        delete this.previewCharts[id]
      }
      this.widgets = this.widgets.filter(w => w.id !== id)
    },
    openSettings(widget) {
      this.activeWidget = { ...widget }
      this.showDrawer = true
    },
    closeDrawer() {
      this.showDrawer = false
      this.activeWidget = null
    },
    async applySettings() {
      const index = this.widgets.findIndex(w => w.id === this.activeWidget.id)
      if (index !== -1) {
        this.widgets.splice(index, 1, { ...this.activeWidget })
        if (!['kpi', 'table'].includes(this.activeWidget.type)) {
          await this.$nextTick()
          await new Promise(r => setTimeout(r, 100))
          this.renderPreviewChart(this.activeWidget)
        }
      }
      this.closeDrawer()
    },
    renderPreviewChart(widget) {
      const canvas = document.getElementById('preview-' + widget.id)
      if (!canvas) return

      if (this.previewCharts[widget.id]) {
        this.previewCharts[widget.id].destroy()
      }

      const color = widget.color || '#0d9488'
      const typeMap = {
        bar: 'bar', line: 'line', area: 'line',
        scatter: 'scatter', pie: 'pie'
      }

      const dummyLabels = ['A-1', 'A-2', 'A-3', 'A-4']
      const dummyValues = [120, 85, 150, 110]

      let chartData = {}
      if (widget.type === 'pie') {
        chartData = {
          labels: dummyLabels,
          datasets: [{
            data: dummyValues,
            backgroundColor: ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444'],
            borderWidth: 1
          }]
        }
      } else if (widget.type === 'scatter') {
        chartData = {
          datasets: [{
            label: widget.title,
            data: dummyValues.map((v, i) => ({ x: i + 1, y: v })),
            backgroundColor: color + '99',
            borderColor: color
          }]
        }
      } else {
        chartData = {
          labels: dummyLabels,
          datasets: [{
            label: widget.title,
            data: dummyValues,
            backgroundColor: color + '99',
            borderColor: color,
            borderWidth: 2,
            fill: widget.type === 'area',
            tension: 0.4
          }]
        }
      }

      this.previewCharts[widget.id] = new Chart(canvas, {
        type: typeMap[widget.type] || 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: widget.type === 'pie' ? {} : {
            x: {
              ticks: { font: { size: 9 }, maxRotation: 0 },
              grid: { display: false }
            },
            y: {
              ticks: { font: { size: 9 } }
            }
          }
        }
      })
    },
    isNumericField(field) {
      return ['total_amount', 'unit_price', 'quantity'].includes(field)
    },
    formatMetricLabel(metric) {
  const labels = {
    total_amount: 'Total Amount',
    unit_price: 'Unit Price',
    quantity: 'Quantity',
    first_name: 'Customer Name',
    status: 'Status',
    product: 'Product',
    created_by: 'Created By'
  }
  return labels[metric] || metric || 'Select metric'
},
    async saveConfig() {
      try {
        await saveDashboard({ widgets: this.widgets })
        this.$router.push('/')
      } catch (error) {
        console.error('Error saving config:', error)
      }
    }
  }
}
</script>