# TeleConnect Analytics Dashboard

A full-stack Internet and Mobile Services Order and Analytics Dashboard.

## Live Demo
- Live Site: https://halleyx-dashboard-two.vercel.app
- GitHub: https://github.com/vasanthh45/halleyx-dashboard
- Demo Video: https://drive.google.com/file/d/18Dq3cnKCT3o6DcaakndOKTLFBRYNz2UY/view?usp=drivesdk

## Tech Stack
- Frontend: Vue.js, Chart.js, CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL

## Features
- Create, Edit, Delete customer orders
- Dashboard with Bar, Line, Pie, Area charts
- Drag and drop widget configuration
- Date range filter
- Form validation
- Responsive design

## Setup Instructions

### Step 1 - Clone the repo
```
git clone https://github.com/vasanthh45/halleyx-dashboard.git
```

### Step 2 - Backend setup
```
cd backend
npm install
node index.js
```

### Step 3 - Frontend setup
```
cd frontend
npm install
npm run dev
```

### Step 4 - Database
Create PostgreSQL database named halleyx_db and run this SQL:
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(20),
  order_id VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  product VARCHAR(150) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_by VARCHAR(100) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_config (
  id SERIAL PRIMARY KEY,
  layout_json TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);