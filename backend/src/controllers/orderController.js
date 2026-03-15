const pool = require('../config/db')

const getOrders = async (req, res) => {
  try {
    const { dateRange } = req.query
    let query = 'SELECT * FROM orders'

    if (dateRange === 'today') {
      query += ' WHERE DATE(created_at) = CURRENT_DATE'
    } else if (dateRange === '7days') {
      query += " WHERE created_at >= NOW() - INTERVAL '7 days'"
    } else if (dateRange === '30days') {
      query += " WHERE created_at >= NOW() - INTERVAL '30 days'"
    } else if (dateRange === '90days') {
      query += " WHERE created_at >= NOW() - INTERVAL '90 days'"
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query)
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

    if (!first_name || !last_name || !email || !phone ||
        !street_address || !city || !state || !postal_code ||
        !country || !product || !quantity || !unit_price || !created_by) {
      return res.status(400).json({
        success: false,
        message: 'Please fill the field'
      })
    }

    const result = await pool.query(
      `INSERT INTO orders (
        first_name, last_name, email, phone,
        street_address, city, state, postal_code, country,
        product, quantity, unit_price, total_amount,
        status, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        first_name, last_name, email, phone,
        street_address, city, state, postal_code, country,
        product, quantity, unit_price, total_amount,
        status || 'Pending', created_by
      ]
    )
    res.json({ success: true, data: result.rows[0] })
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
    await pool.query('DELETE FROM orders WHERE id=$1', [id])
    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getOrders, createOrder, updateOrder, deleteOrder }