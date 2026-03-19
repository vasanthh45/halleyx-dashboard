<template>
  <div class="config-layout">

    <!-- Header -->
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

      <!-- Widget Library -->
      <div class="widget-library">
        <p class="library-title">Widget library</p>

        <div v-for="section in librarySections" :key="section.key" class="library-section">
          <div class="library-section-header" @click="toggleSection(section.key)">
            <span>{{ section.label }}</span>
            <span>{{ openSections[section.key] ? '▾' : '▸' }}</span>
          </div>
          <div v-if="openSections[section.key]" class="library-items">
            <div
              v-for="item in section.items"
              :key="item.type"
              class="library-item"
              draggable="true"
              @dragstart="onLibraryDragStart($event, item.type)"
              @click="addWidget(item.type)"
            >
              <span class="widget-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Area -->
      <div
        class="canvas-area"
        :class="{ 'canvas-drag-over': isDraggingOverCanvas }"
        @dragover="onCanvasDragOver"
        @dragleave="onCanvasDragLeave"
        @drop="onCanvasDrop"
      >
        <!-- Empty State -->
        <div v-if="widgets.length === 0" class="canvas-empty">
          <div class="canvas-empty-icon">📊</div>
          <p v-if="!isDraggingOverCanvas">Click or drag widgets from the library to add them here</p>
          <p v-else style="color:#0d9488; font-weight:500">Release to add widget</p>
        </div>

        <!-- Widgets Grid -->
        <div v-else class="widgets-grid">
          <div
            v-for="widget in widgets"
            :key="widget.id"
            class="widget-card"
            :class="{ 'drag-over': dragOverWidgetId === widget.id }"
            :style="{ gridColumn: 'span ' + widget.width }"
            draggable="true"
            @dragstart="onWidgetDragStart($event, widget.id)"
            @dragover="onWidgetDragOver($event, widget.id)"
            @dragleave="onWidgetDragLeave"
            @drop="onWidgetDrop($event, widget.id)"
          >
            <div class="widget-card-header">
              <span class="widget-card-title">{{ widget.title }}</span>
              <div class="widget-card-actions">
                <button class="widget-action-btn" @click.stop="openSettings(widget)">⚙</button>
                <button class="widget-action-btn delete" @click.stop="removeWidget(widget.id)">✕</button>
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
              <!-- Chart Preview -->
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

          <!-- KPI Settings -->
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
              <select v-model="activeWidget.aggregation" class="form-input" :disabled="!isNumericField(activeWidget.metric)">
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

          <!-- Bar / Line / Area / Scatter Settings -->
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

          <!-- Pie Settings -->
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

          <!-- Table Settings -->
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
            <div class="form-group">
              <label class="form-label checkbox-label">
                <input type="checkbox" v-model="activeWidget.applyFilter"/>
                Apply filter
              </label>
            </div>
            <div v-if="activeWidget.applyFilter" class="filter-section">
              <div class="filter-section-header">
                <span style="font-size:13px; font-weight:500; color:#374151">Filters</span>
                <button class="btn-add-filter" @click="addFilter">+ Add filter</button>
              </div>
              <div v-for="(filter, index) in activeWidget.filters" :key="index" class="filter-row">
                <select v-model="filter.column" class="form-input filter-select-sm">
                  <option value="">Column</option>
                  <option v-for="col in tableColumns" :key="col.value" :value="col.value">{{ col.label }}</option>
                </select>
                <select v-model="filter.condition" class="form-input filter-select-sm">
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="greater_than">greater than</option>
                  <option value="less_than">less than</option>
                </select>
                <input v-model="filter.value" class="form-input filter-input-sm" type="text" placeholder="Value"/>
                <button class="btn-remove-filter" @click="removeFilter(index)">✕</button>
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
      dragType: null,
      dragWidgetId: null,
      dragOverWidgetId: null,
      isDraggingOverCanvas: false,
      openSections: { charts: true, tables: true, kpis: true },

      // Library sections config — easy to extend
      librarySections: [
        {
          key: 'charts',
          label: 'Charts',
          items: [
            { type: 'bar',     icon: '📊', label: 'Bar Chart'    },
            { type: 'line',    icon: '📈', label: 'Line Chart'   },
            { type: 'pie',     icon: '🥧', label: 'Pie Chart'    },
            { type: 'area',    icon: '📉', label: 'Area Chart'   },
            { type: 'scatter', icon: '✦',  label: 'Scatter Plot' }
          ]
        },
        {
          key: 'tables',
          label: 'Tables',
          items: [{ type: 'table', icon: '📋', label: 'Table' }]
        },
        {
          key: 'kpis',
          label: 'KPIs',
          items: [{ type: 'kpi', icon: '🔢', label: 'KPI Value' }]
        }
      ],

      tableColumns: [
        { label: 'Customer ID',   value: 'customer_id'   },
        { label: 'Customer name', value: 'customer_name' },
        { label: 'Email id',      value: 'email'         },
        { label: 'Phone number',  value: 'phone'         },
        { label: 'Address',       value: 'address'       },
        { label: 'Order ID',      value: 'order_id'      },
        { label: 'Order date',    value: 'order_date'    },
        { label: 'Product',       value: 'product'       },
        { label: 'Quantity',      value: 'quantity'      },
        { label: 'Unit price',    value: 'unit_price'    },
        { label: 'Total amount',  value: 'total_amount'  },
        { label: 'Status',        value: 'status'        },
        { label: 'Created by',    value: 'created_by'    }
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

    // ── Config Loading ────────────────────────────────────
    async loadExistingConfig() {
      try {
        const response = await getDashboard()
        if (response.data.data && response.data.data.layout_json) {
          this.widgets = response.data.data.layout_json
          await this.$nextTick()
          this.widgets.forEach(w => {
            if (!['kpi', 'table'].includes(w.type)) this.renderPreviewChart(w)
          })
        }
      } catch (e) {}
    },

    // ── Library Drag (from sidebar to canvas) ────────────
    onLibraryDragStart(event, type) {
      this.dragType = type
      this.dragWidgetId = null
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('text/plain', type)
    },

    // ── Canvas Drop ───────────────────────────────────────
    onCanvasDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      this.isDraggingOverCanvas = true
    },

    onCanvasDragLeave(event) {
      const rect = event.currentTarget.getBoundingClientRect()
      const outside =
        event.clientX < rect.left  ||
        event.clientX >= rect.right ||
        event.clientY < rect.top   ||
        event.clientY >= rect.bottom
      if (outside) this.isDraggingOverCanvas = false
    },

    onCanvasDrop(event) {
      event.preventDefault()
      this.isDraggingOverCanvas = false
      const data = event.dataTransfer.getData('text/plain')
      const widgetTypes = ['bar','line','pie','area','scatter','table','kpi']
      if (widgetTypes.includes(data)) {
        this.addWidget(data)
      }
      this.dragType = null
    },

    // ── Widget Reorder Drag ───────────────────────────────
    onWidgetDragStart(event, id) {
      this.dragWidgetId = id
      this.dragType = null
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', id.toString())
      // Small delay so drag image renders before style change
      setTimeout(() => { this.dragOverWidgetId = null }, 0)
    },

    onWidgetDragOver(event, id) {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      if (this.dragWidgetId && this.dragWidgetId !== id) {
        this.dragOverWidgetId = id
      }
    },

    onWidgetDragLeave(event) {
      // Only clear if truly leaving the card (not entering a child element)
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.dragOverWidgetId = null
      }
    },

    onWidgetDrop(event, targetId) {
      event.preventDefault()
      event.stopPropagation()
      if (this.dragWidgetId && this.dragWidgetId !== targetId) {
        const fromIndex = this.widgets.findIndex(w => w.id === this.dragWidgetId)
        const toIndex   = this.widgets.findIndex(w => w.id === targetId)
        if (fromIndex !== -1 && toIndex !== -1) {
          const moved = this.widgets.splice(fromIndex, 1)[0]
          this.widgets.splice(toIndex, 0, moved)
        }
      }
      this.dragWidgetId    = null
      this.dragOverWidgetId = null
    },

    // ── Widget Management ─────────────────────────────────
    async addWidget(type) {
      const widget = {
        id: Date.now(),
        type,
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
        pagination: '10',
        applyFilter: false,
        filters: []
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

    // ── Settings Drawer ───────────────────────────────────
    openSettings(widget) {
      this.activeWidget = { ...widget, filters: widget.filters ? [...widget.filters] : [] }
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

    // ── Filter Helpers ────────────────────────────────────
    addFilter() {
      if (!this.activeWidget.filters) this.activeWidget.filters = []
      this.activeWidget.filters.push({ column: '', condition: 'equals', value: '' })
    },

    removeFilter(index) {
      this.activeWidget.filters.splice(index, 1)
    },

    // ── Chart Preview ─────────────────────────────────────
    renderPreviewChart(widget) {
      const canvas = document.getElementById('preview-' + widget.id)
      if (!canvas) return
      if (this.previewCharts[widget.id]) this.previewCharts[widget.id].destroy()

      const color = widget.color || '#0d9488'
      const typeMap = { bar: 'bar', line: 'line', area: 'line', scatter: 'scatter', pie: 'pie' }
      const dummyLabels = ['A-1', 'A-2', 'A-3', 'A-4']
      const dummyValues = [120, 85, 150, 110]

      let chartData
      if (widget.type === 'pie') {
        chartData = {
          labels: dummyLabels,
          datasets: [{ data: dummyValues, backgroundColor: ['#0d9488','#3b82f6','#f59e0b','#ef4444'], borderWidth: 1 }]
        }
      } else if (widget.type === 'scatter') {
        chartData = {
          datasets: [{ label: widget.title, data: dummyValues.map((v, i) => ({ x: i + 1, y: v })), backgroundColor: color + '99', borderColor: color }]
        }
      } else {
        chartData = {
          labels: dummyLabels,
          datasets: [{ label: widget.title, data: dummyValues, backgroundColor: color + '99', borderColor: color, borderWidth: 2, fill: widget.type === 'area', tension: 0.4 }]
        }
      }

      this.previewCharts[widget.id] = new Chart(canvas, {
        type: typeMap[widget.type] || 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: widget.type === 'pie' ? {} : {
            x: { ticks: { font: { size: 9 }, maxRotation: 0 }, grid: { display: false } },
            y: { ticks: { font: { size: 9 } } }
          }
        }
      })
    },

    // ── Utility Helpers ───────────────────────────────────
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
      const widths = { kpi: 2, pie: 4, table: 4 }
      return widths[type] || 5
    },

    getDefaultHeight(type) {
      const heights = { kpi: 2, pie: 4, table: 4 }
      return heights[type] || 5
    },

    isNumericField(field) {
      return ['total_amount', 'unit_price', 'quantity'].includes(field)
    },

    formatMetricLabel(metric) {
      const labels = {
        total_amount: 'Total Amount', unit_price: 'Unit Price',
        quantity: 'Quantity', first_name: 'Customer Name',
        status: 'Status', product: 'Product', created_by: 'Created By'
      }
      return labels[metric] || metric || 'Select metric'
    },

    async saveConfig() {
      try {
        await saveDashboard({ widgets: this.widgets })
        this.$router.push('/')
      } catch (e) {}
    }
  }
}
</script>
```

Save with **Ctrl+S** and test — drag a widget card over another card, you should see the blue highlight border, release and it swaps. Then push:
```
cd "C:\Users\Vasanth\OneDrive - Kamaraj College of Engineering and Technology\Desktop\halleyx-dashboard"
git add .
git commit -m "Optimize DashboardConfig - fix widget reorder drag drop, clean code structure"
git push