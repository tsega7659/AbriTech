import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Loader from './components/Loading';

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ChangeCredentials = lazy(() => import('./pages/auth/ChangeCredentials'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const StudentManagement = lazy(() => import('./pages/admin/StudentManagement'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));
const CourseLessons = lazy(() => import('./pages/admin/CourseLessons'));
const InstructorManagement = lazy(() => import('./pages/admin/InstructorManagement'));
const ParentManagement = lazy(() => import('./pages/admin/ParentManagement'));
const UserRegistration = lazy(() => import('./pages/admin/UserRegistration'));
const ProjectReview = lazy(() => import('./pages/admin/ProjectReview'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const MessageManagement = lazy(() => import('./pages/admin/MessageManagement'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const ActivityMonitoring = lazy(() => import('./pages/admin/ActivityMonitoring'));

// Instructor Pages
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorCourses = lazy(() => import('./pages/instructor/InstructorCourses'));
const InstructorCourseStudents = lazy(() => import('./pages/instructor/InstructorCourseStudents'));
const InstructorStudentDetail = lazy(() => import('./pages/instructor/InstructorStudentDetail'));
const InstructorProjects = lazy(() => import('./pages/instructor/InstructorProjects'));
const InstructorStudents = lazy(() => import('./pages/instructor/InstructorStudents'));

// Common
const Settings = lazy(() => import('./pages/common/Settings'));

import ChatWidget from './components/ChatWidget';
import './index.css';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <Loader fullScreen={false} message="Loading module..." />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/change-credentials" 
              element={
                <ProtectedRoute>
                  <ChangeCredentials />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout role="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="courses" element={<CourseManagement />} />
              <Route path="courses/:courseId/lessons" element={<CourseLessons />} />
              <Route path="instructors" element={<InstructorManagement />} />
              <Route path="parents" element={<ParentManagement />} />
              <Route path="users/register" element={<UserRegistration />} />
              <Route path="projects" element={<ProjectReview />} />
              <Route path="blogs" element={<BlogManagement />} />
              <Route path="messages" element={<MessageManagement />} />
              <Route path="payments" element={<Payments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="activity" element={<ActivityMonitoring />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Instructor Routes */}
            <Route 
              path="/instructor" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <DashboardLayout role="instructor" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorCourses />} />
              <Route path="courses/:courseId/students" element={<InstructorCourseStudents />} />
              <Route path="courses/:courseId/students/:studentId" element={<InstructorStudentDetail />} />
              <Route path="projects" element={<InstructorProjects />} />
              <Route path="students" element={<InstructorStudents />} />
              <Route path="analytics" element={<div>Performance (Pending)</div>} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <ChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;

export default App;
