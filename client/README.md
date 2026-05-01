# Healthcare Monitoring System 🏥

A real-time healthcare bed monitoring platform with admin management, user subscriptions, and automated email alerts. Built with React + Vite frontend, Express backend, and MongoDB database.

## 🎯 Key Features

### 👤 User Panel
- **Dashboard**: Real-time view of all hospitals with bed availability, capacity, and critical alerts
- **Bed Finder**: Search and filter hospitals by region to find available beds
- **Watchlist**: Subscribe to hospitals and receive email alerts when critical situations occur

### 🛡️ Admin Panel  
- **User Management**: View all registered users and their hospital subscriptions
- **Hospital Management**: Add, update, and manage hospital information, bed capacity, and alert thresholds
- **Alert History**: Monitor all critical alerts and their history

### 📧 Email Alert System
- Automated email notifications via Gmail SMTP
- Subscribers get alerts when hospitals reach critical bed capacity
- Real-time notifications sent instantly when conditions change

### ⚙️ Background Services
- **Simulation Service**: Generates realistic bed availability updates every minute
- **External API Sync**: Syncs with external hospital data sources every 5 minutes

## 1) System Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + React Router + Axios + Bootstrap + Leaflet Map
- **Backend**: Express 5 + MongoDB + Mongoose + JWT Authentication
- **Security**: bcryptjs password hashing, JWT tokens, role-based access control
- **Email**: Nodemailer with Gmail SMTP
- **Logging**: Morgan HTTP logger

### Data Flow
```
User (Frontend) 
  ↓ (Register/Login)
JWT Authentication
  ↓ (Token stored in localStorage)
Protected API Routes (with authMiddleware)
  ↓ (Controllers access data)
MongoDB Collections (Users, Hospitals, Subscriptions, Alerts)
  ↓ (Background Services update data)
Simulation & External API Services
  ↓ (Alert triggered)
Email Service → Subscribers receive notifications
```

## 2) Database Models

- **User**: username, email, password (hashed), role, timestamps
- **Hospital**: name, region, status, capacity, coordinates, timestamps
- **Subscription**: userId, hospitalId, userEmail, userName, timestamps (unique constraint on userId+hospitalId)
- **Alert**: message, hospitalId, type (capacity/medicine/status), timestamp

## 3) API Endpoints

### Authentication Routes (Public)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login, returns JWT token

### Hospital Routes (Protected)
- `GET /api/hospitals` - Get all hospitals with real-time data
- `GET /api/hospitals/:id` - Get single hospital details
- `POST /api/hospitals` - Create new hospital (admin only)
- `PUT /api/hospitals/:id` - Update hospital info (admin only)
- `GET /api/hospitals/alerts` - Get alert feed with hospital details

### Admin Routes (Protected - Admin Only)
- `GET /api/admin/users` - List all users with subscription counts
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/subscriptions` - View all subscriptions
- `POST /api/admin/subscriptions` - Create subscription
- `DELETE /api/admin/subscriptions/:id` - Remove subscription
- `GET /api/admin/alerts` - Get all alerts history
- `POST /api/admin/alerts` - Manually create alert

## 4) Frontend File-by-File

### client root

- .gitignore: Ignore logs/build outputs/editor artifacts. Depends on git behavior.
- eslint.config.js: ESLint flat config for JS/JSX with React hooks and refresh rules. Depends on eslint plugins.
- index.html: Vite entry HTML with root div and main.jsx script mount.
- package.json: Frontend scripts and dependencies (React, Router, Axios, Bootstrap, Leaflet, Vite).
- package-lock.json: Exact npm dependency tree lock (auto-generated).
- README.md: This documentation.
- vite.config.js: Vite build/dev config with React plugin.

### client/src

- main.jsx: React bootstrap entry; mounts App into #root. Depends on react-dom and App.
- App.jsx: Router setup + AuthProvider + global navbar + page routes. Depends on React Router, context, pages/components, Bootstrap CSS.

### client/src/context

- AuthContext.jsx: Authentication state container (user, login, logout) using localStorage persistence. Used by Navbar, Login, Register, Dashboard.

### client/src/pages

- Login.jsx: Login form page. Calls authService.loginUser; on success stores user through AuthContext then navigates to dashboard.
- Register.jsx: Registration form page. Calls authService.registerUser; on success stores user then navigates to dashboard.
- Dashboard.jsx: Main monitoring page. Polls hospitals/alerts every 5s; redirects to login if unauthenticated. Uses HospitalCard, MapView, AlertBox.

### client/src/components

- Navbar.jsx: Top navigation; shows auth-aware actions and logout flow.
- HospitalCard.jsx: Compact card for hospital metrics and status/capacity/medicine bars.
- AlertBox.jsx: Alert feed panel for latest alerts.
- MapView.jsx: Leaflet map with marker color by hospital status and warning circle for critical hospitals.

### client/src/services

- api.js: Shared Axios instance with baseURL http://localhost:5000/api and JWT interceptor.
- authService.js: Auth API wrappers (register/login).
- hospitalService.js: Hospital API wrappers (get hospitals/get alerts).

### client/src/styles

- global.css: Theme + component styles (navbar, cards, auth UI, map frame, badges, alerts, progress bars).

## 5) Backend File-by-File

### server root

- .env: Runtime config values (MONGO_URI, JWT_SECRET, PORT). Consumed by server/db/auth logic.
- package.json: Backend scripts/dependencies (Express, Mongoose, JWT, bcrypt, axios, cors, dotenv).
- package-lock.json: Exact npm dependency tree lock (auto-generated).
- server.js: App bootstrap. Loads env, connects DB, mounts routes, starts server, starts simulation and external sync jobs.

### server/config

- db.js: MongoDB connection helper via mongoose.connect(process.env.MONGO_URI).

### server/models

- User.js: User schema (username, email, hashed password, timestamps).
- Hospital.js: Hospital schema (name, status, capacity, location, region, medicineSupply, timestamps).
- Alert.js: Alert schema (message, hospital reference, type, timestamp).

### server/controllers

- authController.js: Register/login handlers. Uses bcrypt for hashing/checking and JWT signing for token generation.
- hospitalController.js: CRUD/read handlers for hospitals and alert-feed retrieval.

### server/middleware

- authMiddleware.js: protect middleware; validates Bearer token, decodes JWT, and attaches user to request.

### server/routes

- authRoutes.js: Public auth routes (register/login).
- hospitalRoutes.js: Protected hospital and alert routes wired to middleware + controller handlers.

### server/services

- simulationService.js: 5-second simulation loop; randomly changes capacity/medicineSupply, updates status, creates alerts for critical/low medicine conditions.
- externalApiService.js: External data sync jobs.
	- WHO API sync updates medicineSupply by region mapping.
	- Overpass/OpenStreetMap sync updates hospital coordinates.
	- Schedules WHO sync every 6h and OSM sync every 24h.

## 6) Database Folder File-by-File

- hospitalData.json: Seed dataset containing hospital entities (name, region, status, capacity, coordinates, medicineSupply).
- seed.js: One-time seeder script. Reads hospitalData.json, connects to MongoDB, inserts hospitals, skips duplicate key errors.

## 7) How Frontend, Backend, DB, and API Work Together

1. Frontend calls auth and hospital endpoints via Axios service wrappers.
2. Backend verifies JWT on protected routes before hospital/alert access.
3. Controllers read/write MongoDB through Mongoose models.
4. Simulation and external sync services continuously mutate hospital data and generate alerts.
5. Dashboard polling (every 5s) reflects near real-time backend state in cards, map, and alerts panel.

## 8) Notes

- This project has clear separation by responsibility: pages/components/services on frontend, routes/middleware/controllers/services/models on backend.
- Background jobs are started automatically when backend boots, so dashboard values evolve over time without manual updates.
