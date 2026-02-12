import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import GetStarted from "./pages/auth/GetStarted";
import RegisterStudent from "./pages/auth/RegisterStudent";
import RegisterParent from "./pages/auth/RegisterParent";
import Login from "./pages/auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentCourses from "./pages/dashboard/StudentCourses";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
import ParentChildren from "./pages/dashboard/ParentChildren";
import Grades from "./pages/dashboard/Grades";
import {
  StudentPortfolio,
  StudentProjects,
  StudentAITutor,
  ParentReports,
  ParentEvents
} from "./pages/dashboard/PlaceholderPages";
import CourseDetail from "./pages/dashboard/CourseDetail";
import LessonPlayer from "./pages/dashboard/LessonPlayer";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import { ParentProvider } from "./context/ParentContext";
import ChatWidget from "./components/ChatWidget";

import './index.css'


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="about" element={<About />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogDetail />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="get-started" element={<GetStarted />} />
            <Route path="register/student" element={<RegisterStudent />} />
            <Route path="register/parent" element={<RegisterParent />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard/student" element={
            <StudentProvider>
              <DashboardLayout role="student" />
            </StudentProvider>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="courses/:courseId/learn/:lessonId" element={<LessonPlayer />} />
            <Route path="grades" element={<Grades />} />

            <Route path="portfolio" element={<StudentPortfolio />} />
            <Route path="projects" element={<StudentProjects />} />
          </Route>

          <Route path="/dashboard/parent" element={
            <ParentProvider>
              <DashboardLayout role="parent" />
            </ParentProvider>
          }>
            <Route index element={<ParentDashboard />} />
            <Route path="children" element={<ParentChildren />} />
            <Route path="reports" element={<ParentReports />} />
            <Route path="events" element={<ParentEvents />} />
          </Route>

        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
