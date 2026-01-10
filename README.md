# AbriTech Learning Management System (LMS) 

A comprehensive, role-based LMS designed to empower students, parents, teachers, and administrators with a seamless educational experience.

##  System Architecture

The project is divided into three main components:

- **Public Website (`/FrontEnd/react`)**: The main portal for Students and Parents.
- **Admin Portal (`/Admin_FrontEnd/admin`)**: A dedicated management interface for Administrators and Teachers (Instructors).
- **Backend API (`/BackEnd`)**: A robust Node.js and Express server powered by a MySQL database.

---

##  Targeted User Roles

### 1. Students 
- **Portal**: Public Website
- **Features**: Browse & enroll in courses, track learning progress, access assignments, and view personal portfolios.
- **Referral System**: Every student gets a unique referral code to link parents.

### 2. Parents 
- **Portal**: Public Website
- **Features**: Dedicated dashboard to monitor linked student progress, view learning reports, and stay updated on school events.

### 3. Teachers (Instructors) 
- **Portal**: Admin Portal
- **Features**: Manage assigned courses, track student performance, review project submissions, and view class analytics.

### 4. Administrators 
- **Portal**: Admin Portal
- **Features**: Full system management, user registration control, course creation, and data analytics.

---

##  Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MySQL 
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

---

##  Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server

### 1. Database Setup
1. Create a MySQL database named `abri_db` .
2. The schema will automatically initialize on the first server run.

### 2. Backend Installation
```bash
cd BackEnd
npm install
# Create a .env file with your DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME
npm start
```

### 3. Public Frontend Installation
```bash
cd FrontEnd/react
npm install
npm run dev
```

### 4. Admin Frontend Installation
```bash
cd Admin_FrontEnd/admin
npm install
npm run dev
```

---

## Deployed Urls

- (https://abri-tech.vercel.app/)
- https://abritech-admin.vercel.app/

---

## ✨ Design Principles
- **Aesthetic Excellence**: Vibrant colors and premium UI components.
- **Mobile First**: All dashboards are fully responsive for learning on the go.
- **Clean Separation**: Staff and users are kept in separate portals for enhanced security and focus.
