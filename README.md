# Retail Store - Internet Food Store with Delivery

A full-stack e-commerce application for food products with delivery functionality, built with FastAPI, PostgreSQL, SQLAlchemy, React + Vite, and Docker.

## Features

### Customer Features
- Browse products by shop
- View product details (name, price, stock, category, manufacturer, images)
- Add products to cart
- Update cart quantities
- Place orders with delivery address and payment information
- Order tracking

### Admin Panel Features
- **Authentication**: Login with username `admin` and password `12345`
- **Products Management**: Create, edit, delete products; upload/update product images
- **Categories Management**: Create, edit, delete product categories
- **Manufacturers Management**: Create, edit, delete manufacturers
- **Shops Management**: Create, edit, delete shops
- **Companies Management**: Create, edit, delete companies
- **Workers Management**: Create, edit, delete workers (couriers)
- **Posts Management**: Create, edit, delete job posts/positions
- **Orders Management**: View all orders, assign couriers, update order status, delete orders

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React JS, Vite
- **Containerization**: Docker, Docker Compose

## Project Structure

```
/workspace
├── backend/
│   ├── main.py          # FastAPI application entry point
│   ├── config.py        # Configuration settings
│   ├── database.py      # Database connection
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── routes.py        # API routes
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Backend Docker configuration
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   ├── api.js       # API client
│   │   ├── main.jsx     # React entry point
│   │   ├── index.css    # Global styles
│   │   └── App.css      # Component styles
│   ├── package.json     # Node dependencies
│   ├── vite.config.js   # Vite configuration
│   ├── index.html       # HTML template
│   └── Dockerfile       # Frontend Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── init.sql            # Database initialization script
```

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine

### Running the Application

1. Navigate to the project directory:
```bash
cd /workspace
```

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

### Admin Login
- **Username**: `admin`
- **Password**: `12345`

## API Endpoints

### Authentication
- `POST /api/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/{id}/upload-image` - Upload product image
- `PUT /api/products/{id}/update-image` - Update product image

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Manufacturers
- `GET /api/manufacturers` - Get all manufacturers
- `POST /api/manufacturers` - Create manufacturer
- `PUT /api/manufacturers/{id}` - Update manufacturer
- `DELETE /api/manufacturers/{id}` - Delete manufacturer

### Shops
- `GET /api/shops` - Get all shops
- `POST /api/shops` - Create shop
- `PUT /api/shops/{id}` - Update shop
- `DELETE /api/shops/{id}` - Delete shop

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Create worker
- `PUT /api/workers/{id}` - Update worker
- `DELETE /api/workers/{id}` - Delete worker

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Place new order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

## Database Schema

The application uses a normalized PostgreSQL database with the following tables:
- companies
- shops
- categories
- manufacturers
- products
- product_image_groups
- images
- customers
- payments
- posts
- workers
- orders
- order_items
- checks

## Usage Guide

### For Customers
1. Browse products on the main page
2. Filter products by shop if needed
3. Add desired products to cart
4. Go to cart and review items
5. Fill in delivery information (name, phone, address, payment bank)
6. Place order

### For Administrators
1. Login with admin credentials
2. Navigate through different tabs in the admin panel
3. Use forms to create new entries
4. Click "Edit" to modify existing entries
5. Click "Delete" to remove entries
6. For products: upload images using the file input
7. For orders: assign couriers and update status

## Stopping the Application

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```
