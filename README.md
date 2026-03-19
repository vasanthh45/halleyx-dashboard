\# TeleConnect Analytics Dashboard



A full-stack Internet and Mobile Services Order and Analytics Dashboard.



\## Live Demo

\- Live Site: https://halleyx-dashboard-two.vercel.app

\- GitHub: https://github.com/vasanthh45/halleyx-dashboard



\## Tech Stack

\- Frontend: Vue.js, Chart.js, CSS

\- Backend: Node.js, Express.js

\- Database: PostgreSQL



\## Features

\- Create, Edit, Delete customer orders

\- Dashboard with Bar, Line, Pie, Area charts

\- Drag and drop widget configuration

\- Date range filter

\- Form validation

\- Responsive design



\## Setup Instructions



\### Step 1 - Clone the repo

git clone https://github.com/vasanthh45/halleyx-dashboard.git



\### Step 2 - Backend setup

cd backend

npm install

node index.js



\### Step 3 - Frontend setup

cd frontend

npm install

npm run dev



\### Step 4 - Database

Create PostgreSQL database named halleyx\_db

Run this SQL to create tables:



CREATE TABLE orders (

&#x20; id SERIAL PRIMARY KEY,

&#x20; customer\_id VARCHAR(20),

&#x20; order\_id VARCHAR(20),

&#x20; first\_name VARCHAR(100) NOT NULL,

&#x20; last\_name VARCHAR(100) NOT NULL,

&#x20; email VARCHAR(150) NOT NULL,

&#x20; phone VARCHAR(20) NOT NULL,

&#x20; street\_address VARCHAR(255) NOT NULL,

&#x20; city VARCHAR(100) NOT NULL,

&#x20; state VARCHAR(100) NOT NULL,

&#x20; postal\_code VARCHAR(20) NOT NULL,

&#x20; country VARCHAR(100) NOT NULL,

&#x20; product VARCHAR(150) NOT NULL,

&#x20; quantity INTEGER NOT NULL DEFAULT 1,

&#x20; unit\_price DECIMAL(10,2) NOT NULL,

&#x20; total\_amount DECIMAL(10,2) NOT NULL,

&#x20; status VARCHAR(50) NOT NULL DEFAULT 'Pending',

&#x20; created\_by VARCHAR(100) NOT NULL,

&#x20; order\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

&#x20; created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);



CREATE TABLE dashboard\_config (

&#x20; id SERIAL PRIMARY KEY,

&#x20; layout\_json TEXT,

&#x20; updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);



