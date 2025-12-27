import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import GetStarted from "./pages/auth/GetStarted";
import RegisterStudent from "./pages/auth/RegisterStudent";
import RegisterParent from "./pages/auth/RegisterParent";
import Login from "./pages/auth/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentCourses from "./pages/dashboard/StudentCourses";
import CourseDetail from "./pages/dashboard/CourseDetail";
import LessonPlayer from "./pages/dashboard/LessonPlayer";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
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
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
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
        <Route path="/dashboard/student" element={<DashboardLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          {/* Add sub-routes like courses, progress here later */}
        </Route>

        <Route path="/dashboard/parent" element={<DashboardLayout role="parent" />}>
          <Route index element={<ParentDashboard />} />
          {/* Add sub-routes like children, reports here later */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
