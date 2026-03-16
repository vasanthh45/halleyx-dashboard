const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./src/config/db')
const orderRoutes = require('./src/routes/orderRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/orders', orderRoutes)

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

app.get('/api/widget-data', async (req, res) => {
  try {
    const { type, metric, aggregation, xAxis, yAxis, chartData, dateRange } = req.query

    let dateFilter = ''
    if (dateRange === 'today') {
      dateFilter = ' WHERE DATE(created_at) = CURRENT_DATE'
    } else if (dateRange === '7days') {
      dateFilter = " WHERE created_at >= NOW() - INTERVAL '7 days'"
    } else if (dateRange === '30days') {
      dateFilter = " WHERE created_at >= NOW() - INTERVAL '30 days'"
    } else if (dateRange === '90days') {
      dateFilter = " WHERE created_at >= NOW() - INTERVAL '90 days'"
    }

    if (type === 'kpi') {
      const numericFields = ['total_amount', 'unit_price', 'quantity']
      if (!numericFields.includes(metric)) {
        const result = await pool.query(
          'SELECT COUNT(*) as value FROM orders' + dateFilter
        )
        return res.json({ success: true, value: result.rows[0].value })
      }
      let aggFunc = 'SUM'
      if (aggregation === 'Average') aggFunc = 'AVG'
      if (aggregation === 'Count') aggFunc = 'COUNT'
      const result = await pool.query(
        'SELECT ' + aggFunc + '(' + metric + ') as value FROM orders' + dateFilter
      )
      return res.json({
        success: true,
        value: parseFloat(result.rows[0].value || 0).toFixed(2)
      })
    }

    if (type === 'bar' || type === 'line' || type === 'area' || type === 'scatter') {
      let selectValue = 'COUNT(*)'
      if (yAxis === 'total_amount') selectValue = 'SUM(total_amount)'
      else if (yAxis === 'quantity') selectValue = 'SUM(quantity)'
      else if (yAxis === 'unit_price') selectValue = 'AVG(unit_price)'
      const result = await pool.query(
        'SELECT ' + xAxis + ' as label, ' + selectValue + ' as value FROM orders' + dateFilter + ' GROUP BY ' + xAxis + ' ORDER BY value DESC'
      )
      return res.json({ success: true, data: result.rows })
    }

    if (type === 'pie') {
      const result = await pool.query(
        'SELECT ' + chartData + ' as label, COUNT(*) as value FROM orders' + dateFilter + ' GROUP BY ' + chartData
      )
      return res.json({ success: true, data: result.rows })
    }

    if (type === 'table') {
      const result = await pool.query(
        'SELECT * FROM orders' + dateFilter + ' ORDER BY created_at DESC'
      )
      return res.json({ success: true, data: result.rows })
    }

    res.json({ success: true, data: [] })
  } catch (error) {
    console.error('Widget data error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'Halleyx Dashboard Backend is running!' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
