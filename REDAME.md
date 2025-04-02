# Store Management API

A RESTful API for creating and managing products in a store, handling stock inventory, and tracking sales.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Running Tests](#running-tests)
- [Docker Setup](#docker-setup)
- [Future Improvements](#future-improvements)

## Features

- Authentication system for store managers
- Complete product lifecycle management
- Inventory tracking with audit trails
- Sales recording and processing
- Historical data for product changes
- Input validation and error handling

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety and modern JavaScript features
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Jest** - Testing framework
- **JWT** - Token-based authentication
- **Docker** - Containerization
- **Winston** - Logging
- **Joi** - Validation

## Project Structure

```
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── exceptions/        # Exceptions handlers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── validators/        # Input validation schemas
│   └── app.ts             # Express app setup
├── tests/                 # Test files
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker compose setup
├── jest.config.js         # Jest configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Database Design

### Collections

1. **Managers**
   - Handles authentication and user management
   - Stores manager information and credentials

2. **Products**
   - Core product information
   - Includes name, description, price, category, availableQuantity
   - Tracks metadata like creation and update timestamps

3. **ProductChangeHistory**
   - Tracks all changes to products
   - Records previous and new states
   - Maintains who made changes and when

4. **StockTransactions**
   - Records inventory additions and removals
   - Maintains audit trail for stock changes
   - Includes notes for context

5. **Sales**
   - Records customer purchases
   - Tracks which products were sold and quantities
   - Maintains price at time of sale

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new manager
- `POST /api/auth/login` - Login and receive JWT token

### Products
- `GET /api/products` - List all products (paginated)
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create new products (array)
- `PUT /api/products/:id` - Update a product
- `PATCH /api/products/:id/status` - Update product status (active/archive/deleted)
- `GET /api/products/:id/history` - View product change history

### Stock Management
- `POST /api/stock-transactions` - Add stock to products
- `GET /api/stock-transactions` - List stock transactions (paginated)
- `GET /api/stock-transactions/:id` - Get specific stock transaction
- `PUT /api/stock-transactions/:id` - Update stock transaction (notes only)
- `DELETE /api/stock-transactions/:id` - Delete stock transaction

### Sales
- `POST /api/sales` - Record a new sale
- `GET /api/sales` - List all sales (paginated)
- `GET /api/sales/:id` - Get specific sale details
- `PUT /api/sales/:id` - Update sale information
- `DELETE /api/sales/:id` - Delete a sale record

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 4.2+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/store-management-api.git
cd store-management-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication:

1. Register a new manager account using `/api/auth/register`
2. Login with your credentials at `/api/auth/login` to receive a JWT token
3. Include the token in the Authorization header for all protected routes:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

## Docker Setup

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t store-management-api .

# Run the container
docker run -p 3000:3000 -d store-management-api

# Using docker-compose
docker-compose up -d
```

## Future Improvements

- Role-based access control for different permission levels
- Product categories management
- Customer management system
- Returns handling
- Reporting and analytics features
- Email notifications
- Webhook integrations

---

## API Endpoints Details

### Manager Authentication

#### Register a new manager
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Store Manager",
  "email": "manager@example.com",
  "password": "securePassword123"
}
```

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "manager@example.com",
  "password": "securePassword123"
}
```
**Response:**
```json
{
  "token": "JWT_TOKEN_HERE",
  "manager": {
    "id": "manager_id",
    "name": "Store Manager",
    "email": "manager@example.com"
  }
}
```

### Products

#### Get all products (paginated)
```
GET /api/products?page=1&limit=10
```

#### Get single product
```
GET /api/products/:id
```

#### Create products
```
POST /api/products
```
**Body:**
```json
[
  {
    "name": "Smartphone X",
    "description": "Latest smartphone with amazing features",
    "price": 999.99,
    "category": "Electronics",
    "availableQuantity": 0,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

#### Update product
```
PUT /api/products/:id
```
**Body:**
```json
{
  "name": "Smartphone X Pro",
  "description": "Updated description",
  "price": 1099.99
}
```

#### Update product status
```
PATCH /api/products/:id/status
```
**Body:**
```json
{
  "status": "DELETED",
  "notes": "Discontinued product"
}
```

### Stock Management

#### Add stock
```
POST /api/stock-transactions
```
**Body:**
```json
[
  {
    "productId": "product_id_here",
    "quantity": 100,
    "notes": "Initial stock arrival"
  }
]
```

#### Get stock transactions
```
GET /api/stock-transactions?page=1&limit=10
```

### Sales

#### Record sale
```
POST /api/sales
```
**Body:**
```json
{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "notes": "In-store purchase"
}
```

#### Get all sales
```
GET /api/sales?page=1&limit=10
```