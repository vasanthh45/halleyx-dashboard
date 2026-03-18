const pool = require('../config/db')

// ── ID Generators ─────────────────────────────────────────

// Uses MAX id to avoid duplicates when rows are deleted
const generateCustomerId = async () => {
  const result = await pool.query('SELECT MAX(id) FROM orders')
  const next = (parseInt(result.rows[0].max) || 0) + 1
  return 'CUST-' + String(next).padStart(4, '0')
}

const generateOrderId = async () => {
  const result = await pool.query('SELECT MAX(id) FROM orders')
  const next = (parseInt(result.rows[0].max) || 0) + 1
  return 'ORD-' + String(next).padStart(4, '0')
}

// ── Date Filter Helper ────────────────────────────────────
const buildDateFilter = (dateRange) => {
  const filters = {
    today: ' WHERE DATE(created_at) = CURRENT_DATE',
    '7days': " WHERE created_at >= NOW() - INTERVAL '7 days'",
    '30days': " WHERE created_at >= NOW() - INTERVAL '30 days'",
    '90days': " WHERE created_at >= NOW() - INTERVAL '90 days'"
  }
  return filters[dateRange] || ''
}

// ── Controllers ───────────────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const { dateRange } = req.query
    const dateFilter = buildDateFilter(dateRange)
    const result = await pool.query(
      `SELECT * FROM orders${dateFilter} ORDER BY created_at ASC`
    )
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      street_address, city, state, postal_code, country,
      product, quantity, unit_price, total_amount,
      status, created_by
    } = req.body

    // Validate required fields
    const required = { first_name, last_name, email, phone, street_address, city, state, postal_code, country, product, quantity, unit_price, created_by }
    const missing = Object.keys(required).filter(k => !required[k])
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      })
    }

    const customer_id = await generateCustomerId()
    const order_id = await generateOrderId()

    const result = await pool.query(
      `INSERT INTO orders (
        customer_id, order_id,
        first_name, last_name, email, phone,
        street_address, city, state, postal_code, country,
        product, quantity, unit_price, total_amount,
        status, created_by, order_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
      RETURNING *`,
      [
        customer_id, order_id,
        first_name, last_name, email, phone,
        street_address, city, state, postal_code, country,
        product, quantity, unit_price, total_amount,
        status || 'Pending', created_by
      ]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params
    const {
      first_name, last_name, email, phone,
      street_address, city, state, postal_code, country,
      product, quantity, unit_price, total_amount,
      status, created_by
    } = req.body

    // Check order exists
    const exists = await pool.query('SELECT id FROM orders WHERE id=$1', [id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const result = await pool.query(
      `UPDATE orders SET
        first_name=$1, last_name=$2, email=$3, phone=$4,
        street_address=$5, city=$6, state=$7, postal_code=$8,
        country=$9, product=$10, quantity=$11, unit_price=$12,
        total_amount=$13, status=$14, created_by=$15
      WHERE id=$16 RETURNING *`,
      [
        first_name, last_name, email, phone,
        street_address, city, state, postal_code, country,
        product, quantity, unit_price, total_amount,
        status, created_by, id
      ]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    // Check order exists before deleting
    const exists = await pool.query('SELECT id FROM orders WHERE id=$1', [id])
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    await pool.query('DELETE FROM orders WHERE id=$1', [id])
    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getOrders, createOrder, updateOrder, deleteOrder }