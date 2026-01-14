# HUDT Audition Platform

Hallmark University Drama Troops audition management system with a modern React frontend and Express.js backend.

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Seed the Database
```bash
cd server && npm run seed
```

### 3. Start Servers
```bash
# Backend (Terminal 1)
cd server && npm start

# Frontend (Terminal 2)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Admin Login
- Username: `admin`
- Password: `hudt2026admin`

---

## 🌐 Deployment Guide

### Frontend (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://hudt-api.onrender.com/api`)

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variables:
   - `PORT` = `10000`
   - `JWT_SECRET` = (generate a secure random string)
   - `NODE_ENV` = `production`

---

## 📁 Project Structure

```
hudt-auditions-2026/
├── index.html          # Entry HTML
├── index.css           # Global styles
├── App.tsx             # Main React app
├── types.ts            # TypeScript types
├── lib/
│   └── api.ts          # API service
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── ApplicationForm.tsx
│   ├── ConfirmationPage.tsx
│   ├── StatusChecker.tsx
│   ├── FAQPage.tsx
│   ├── AdminLogin.tsx
│   └── AdminDashboard.tsx
└── server/
    ├── index.js        # Express server
    ├── config/
    │   └── database.js # SQLite setup
    ├── routes/
    │   ├── applications.js
    │   └── admin.js
    ├── middleware/
    │   ├── auth.js
    │   └── rateLimit.js
    ├── utils/
    │   ├── validators.js
    │   ├── refNumberGenerator.js
    │   └── emailService.js
    └── data/
        └── hudt.db     # SQLite database
```

## 🔑 API Endpoints

### Public
- `POST /api/applications` - Submit application
- `GET /api/applications/status/:id` - Check status

### Admin (Auth Required)
- `POST /api/admin/login` - Login
- `GET /api/admin/dashboard/stats` - Statistics
- `GET /api/admin/applications` - List applications
- `PUT /api/admin/applications/:id` - Update
- `DELETE /api/admin/applications/:id` - Delete
- `GET /api/admin/applications/export` - CSV export
