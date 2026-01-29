import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ChangeCredentials from './pages/auth/ChangeCredentials';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import CourseManagement from './pages/admin/CourseManagement';
import CourseLessons from './pages/admin/CourseLessons';
import InstructorManagement from './pages/admin/InstructorManagement';
import ParentManagement from './pages/admin/ParentManagement';
import UserRegistration from './pages/admin/UserRegistration';
import ProjectReview from './pages/admin/ProjectReview';
import BlogManagement from './pages/admin/BlogManagement';
import Settings from './pages/common/Settings';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import InstructorCourseStudents from './pages/instructor/InstructorCourseStudents';
import InstructorStudentDetail from './pages/instructor/InstructorStudentDetail';
import InstructorProjects from './pages/instructor/InstructorProjects';
import InstructorStudents from './pages/instructor/InstructorStudents';
import { AdminProvider } from './context/AdminContext';
import { InstructorProvider } from './context/InstructorContext';
import './index.css';

function App() {
  return (
    <Router>
      <AdminProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-credentials" element={<ChangeCredentials />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
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
            <Route path="analytics" element={<div>Analytics (Refinement Pending)</div>} />
            <Route path="ai-insights" element={<div>AI Insights (Refinement Pending)</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Instructor Routes */}
          <Route path="/instructor" element={
            <InstructorProvider>
              <DashboardLayout role="instructor" />
            </InstructorProvider>
          }>
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
      </AdminProvider>
    </Router>
  );
}

export default App;
