const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./src/config/db')
const orderRoutes = require('./src/routes/orderRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────────
app.use('/api/orders', orderRoutes)

// ── Dashboard Config ──────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dashboard_config ORDER BY id DESC LIMIT 1'
    )
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null })
    }
    const config = result.rows[0]
    config.layout_json = JSON.parse(config.layout_json)
    res.json({ success: true, data: config })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.post('/api/dashboard', async (req, res) => {
  try {
    const { widgets } = req.body
    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ success: false, message: 'Invalid widgets data' })
    }
    await pool.query('DELETE FROM dashboard_config')
    const result = await pool.query(
      'INSERT INTO dashboard_config (layout_json) VALUES ($1) RETURNING *',
      [JSON.stringify(widgets)]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── Widget Data ───────────────────────────────────────────
app.get('/api/widget-data', async (req, res) => {
  try {
    const { type, metric, aggregation, xAxis, yAxis, chartData, dateRange } = req.query

    // Build date filter safely
    const dateFilter = buildDateFilter(dateRange)

    if (type === 'kpi') {
      return res.json(await getKpiData(metric, aggregation, dateFilter))
    }

    if (['bar', 'line', 'area', 'scatter'].includes(type)) {
      return res.json(await getChartData(xAxis, yAxis, dateFilter))
    }

    if (type === 'pie') {
      return res.json(await getPieData(chartData, dateFilter))
    }

    if (type === 'table') {
      return res.json(await getTableData(dateFilter))
    }

    res.json({ success: true, data: [] })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ── Health Check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Halleyx Dashboard Backend is running!' })
})

// ── Helper Functions ──────────────────────────────────────

// Build safe date filter string
function buildDateFilter(dateRange) {
  const filters = {
    today: ' WHERE DATE(created_at) = CURRENT_DATE',
    '7days': " WHERE created_at >= NOW() - INTERVAL '7 days'",
    '30days': " WHERE created_at >= NOW() - INTERVAL '30 days'",
    '90days': " WHERE created_at >= NOW() - INTERVAL '90 days'"
  }
  return filters[dateRange] || ''
}

// Allowed columns for chart queries — prevents SQL injection
const ALLOWED_COLUMNS = ['product', 'status', 'created_by', 'quantity', 'unit_price', 'total_amount']
const ALLOWED_METRICS = ['total_amount', 'unit_price', 'quantity']

async function getKpiData(metric, aggregation, dateFilter) {
  if (!ALLOWED_METRICS.includes(metric)) {
    const result = await pool.query('SELECT COUNT(*) as value FROM orders' + dateFilter)
    return { success: true, value: result.rows[0].value }
  }
  const aggMap = { Average: 'AVG', Count: 'COUNT', Sum: 'SUM' }
  const aggFunc = aggMap[aggregation] || 'SUM'
  const result = await pool.query(
    `SELECT ${aggFunc}(${metric}) as value FROM orders${dateFilter}`
  )
  return { success: true, value: parseFloat(result.rows[0].value || 0).toFixed(2) }
}

async function getChartData(xAxis, yAxis, dateFilter) {
  if (!ALLOWED_COLUMNS.includes(xAxis) || !ALLOWED_COLUMNS.includes(yAxis)) {
    return { success: false, message: 'Invalid column' }
  }
  const valueMap = {
    total_amount: 'SUM(total_amount)',
    quantity: 'SUM(quantity)',
    unit_price: 'AVG(unit_price)'
  }
  const selectValue = valueMap[yAxis] || 'COUNT(*)'
  const result = await pool.query(
    `SELECT ${xAxis} as label, ${selectValue} as value FROM orders${dateFilter} GROUP BY ${xAxis} ORDER BY value DESC`
  )
  return { success: true, data: result.rows }
}

async function getPieData(chartData, dateFilter) {
  if (!ALLOWED_COLUMNS.includes(chartData)) {
    return { success: false, message: 'Invalid column' }
  }
  const result = await pool.query(
    `SELECT ${chartData} as label, COUNT(*) as value FROM orders${dateFilter} GROUP BY ${chartData}`
  )
  return { success: true, data: result.rows }
}

async function getTableData(dateFilter) {
  const result = await pool.query(
    `SELECT * FROM orders${dateFilter} ORDER BY created_at DESC`
  )
  return { success: true, data: result.rows }
}

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})