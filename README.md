# 🌸 Flower Blossom Web Backend API

A RESTful backend API built with Node.js, Express, TypeScript and MongoDB. It includes user authentication, admin user management, profile management and image upload functionality.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest
- **File Upload**: Multer
- **Email**: Nodemailer (Gmail)

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd flower-blossom-web-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in the root directory
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/flower_blossom_db
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
CLIENT_URL=http://localhost:3000
```

### 4. Run the development server
```bash
npm run dev
```

The server will start at: `http://localhost:8000`

---

## 🧪 Running Tests

```bash
npm test
```

To run tests with coverage report:
```bash
npm test -- --coverage
```

> 77 tests covering auth, admin, profile and upload endpoints.

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| PUT | `/api/auth/:id` | Update own profile | Private |
| POST | `/api/auth/forgot-password` | Send password reset email | Public |
| POST | `/api/auth/reset-password/:token` | Reset password using token | Public |

### 👤 Profile
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/profile/:userId` | Get user profile | Public |
| PUT | `/api/profile/update` | Update user profile | Private |

### 🔧 Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | Get all users (pagination, filter, search) | Admin |
| POST | `/api/admin/users` | Create a new user | Admin |
| GET | `/api/admin/users/:id` | Get user by ID | Admin |
| PUT | `/api/admin/users/:id` | Update user by ID | Admin |
| DELETE | `/api/admin/users/:id` | Delete user by ID | Admin |

### 🖼 Image Upload
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/upload/profile-image` | Upload profile image | Public |
| GET | `/api/upload/profile-image/:userId` | Get profile image URL | Public |
| DELETE | `/api/upload/profile-image/:userId` | Delete profile image | Public |

---

## 🔑 Authentication

This API uses JWT (JSON Web Token) authentication.

After login, include the token in the request header:
```
Authorization: Bearer <your_token>
```

---

## 📁 Project Structure

```
src/
├── config/          # Environment configuration
├── controllers/     # Route handlers
├── database/        # MongoDB connection
├── dtos/            # Data Transfer Objects
├── error/           # Custom error classes
├── middleware/      # Auth and upload middleware
├── models/          # Mongoose models
├── repository/      # Database queries
├── routes/          # API routes
├── service/         # Business logic
└── __tests__/       # Automated tests
```

---

## 📬 Postman Collection

Import the included `postman_collection.json` file into Postman to test all API endpoints.

---

## 👨‍💻 Author

Shreesha Shrestha