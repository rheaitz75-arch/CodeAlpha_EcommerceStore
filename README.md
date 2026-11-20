cd /home/ruthi/CodeAlpha_EcommerceStore

cat << 'EOF' > README.md
# CodeAlpha E-Commerce Store

Full-stack e-commerce web application built with Node.js, Express, `sql.js` (SQLite), HTML, CSS, and JavaScript.

## Features
- Product catalog and product details view
- Shopping cart management
- User registration and login (JWT authentication)
- Order placement, stock updates, and order history

## Setup & Run
1. Install dependencies:
   ```bash
   npm install express sql.js bcryptjs jsonwebtoken cors dotenv