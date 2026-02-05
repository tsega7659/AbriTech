import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [parents, setParents] = useState([]);
    const [adminDashboardStats, setAdminDashboardStats] = useState(null);
    const [loading, setLoading] = useState({
        teachers: false,
        students: false,
        courses: false,
        blogs: false,
        parents: false,
        dashboard: false
    });
    const [error, setError] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchAdminDashboardStats = async () => {
        setLoading(prev => ({ ...prev, dashboard: true }));
        try {
            // Note: Assuming there's an /admin/dashboard endpoint
            // If not, we might need to derive it from other fetches or wait for backend update
            // For now, we'll try to fetch it if it exists.
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setAdminDashboardStats(data);
            } else {
                // If endpoint doesn't exist, we might just use the lists to calculate counts
                console.warn('Admin dashboard stats endpoint not found or failed');
            }
        } catch (err) {
            console.error('Error fetching admin dashboard stats:', err);
        } finally {
            setLoading(prev => ({ ...prev, dashboard: false }));
        }
    };

    const fetchTeachers = async () => {
        setLoading(prev => ({ ...prev, teachers: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/teachers`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setTeachers(data);
            } else {
                setError(data.message || 'Failed to fetch teachers');
            }
        } catch (err) {
            setError('Network error while fetching teachers');
        } finally {
            setLoading(prev => ({ ...prev, teachers: false }));
        }
    };

    const fetchStudents = async () => {
        setLoading(prev => ({ ...prev, students: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/students`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setStudents(data);
            } else {
                setError(data.message || 'Failed to fetch students');
            }
        } catch (err) {
            setError('Network error while fetching students');
        } finally {
            setLoading(prev => ({ ...prev, students: false }));
        }
    };

    const fetchCourses = async () => {
        setLoading(prev => ({ ...prev, courses: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setCourses(data);
            } else {
                setError(data.message || 'Failed to fetch courses');
            }
        } catch (err) {
            setError('Network error while fetching courses');
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    const fetchBlogs = async () => {
        setLoading(prev => ({ ...prev, blogs: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/blogs`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setBlogs(data);
            } else {
                setError(data.message || 'Failed to fetch blogs');
            }
        } catch (err) {
            setError('Network error while fetching blogs');
        } finally {
            setLoading(prev => ({ ...prev, blogs: false }));
        }
    };

    const fetchParents = async () => {
        setLoading(prev => ({ ...prev, parents: true }));
        try {
            const response = await fetch(`${API_BASE_URL}/parents`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                setParents(data);
            } else {
                setError(data.message || 'Failed to fetch parents');
            }
        } catch (err) {
            setError('Network error while fetching parents');
        } finally {
            setLoading(prev => ({ ...prev, parents: false }));
        }
    };

    const registerTeacher = async (teacherData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/teacher`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(teacherData)
            });
            const data = await response.json();
            if (response.ok) {
                await fetchTeachers();
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during teacher registration' };
        }
    };

    const registerStudent = async (studentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(studentData)
            });
            const data = await response.json();
            if (response.ok) {
                await fetchStudents();
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during student registration' };
        }
    };

    const registerAdmin = async (adminData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/admin`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(adminData)
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during admin registration' };
        }
    };

    const registerParent = async (parentData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/parent`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(parentData)
            });
            const data = await response.json();
            if (response.ok) {
                await fetchParents();
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during parent registration' };
        }
    };

    const xhrRequest = (url, method, data, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);

            // Set Headers
            const token = localStorage.getItem('token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            const isFormData = data instanceof FormData;
            if (!isFormData) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            // Progress Tracking
            if (onProgress && xhr.upload) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        onProgress(percent);
                    }
                };
            }

            xhr.onload = () => {
                let responseData;
                try {
                    responseData = JSON.parse(xhr.responseText);
                } catch (e) {
                    responseData = xhr.responseText;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ ok: true, data: responseData });
                } else {
                    resolve({ ok: false, message: responseData.message || 'Request failed' });
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error'));
            };

            xhr.send(isFormData ? data : JSON.stringify(data));
        });
    };

    const registerCourse = async (courseData, onProgress) => {
        try {
            const result = await xhrRequest(`${API_BASE_URL}/courses`, 'POST', courseData, onProgress);
            if (result.ok) {
                await fetchCourses();
                return { success: true, data: result.data };
            }
            return { success: false, message: result.message };
        } catch (err) {
            return { success: false, message: 'Network error during course creation' };
        }
    };

    const createBlog = async (blogData, onProgress) => {
        try {
            const result = await xhrRequest(`${API_BASE_URL}/blogs`, 'POST', blogData, onProgress);
            if (result.ok) {
                await fetchBlogs();
                return { success: true, data: result.data };
            }
            return { success: false, message: result.message };
        } catch (err) {
            return { success: false, message: 'Network error during blog creation' };
        }
    };

    const updateBlog = async (id, blogData, onProgress) => {
        try {
            const result = await xhrRequest(`${API_BASE_URL}/blogs/${id}`, 'PUT', blogData, onProgress);
            if (result.ok) {
                await fetchBlogs();
                return { success: true, data: result.data };
            }
            return { success: false, message: result.message };
        } catch (err) {
            return { success: false, message: 'Network error during blog update' };
        }
    };

    const updateCourse = async (id, courseData, onProgress) => {
        try {
            const result = await xhrRequest(`${API_BASE_URL}/courses/${id}`, 'PUT', courseData, onProgress);
            if (result.ok) {
                await fetchCourses();
                return { success: true, data: result.data };
            }
            return { success: false, message: result.message };
        } catch (err) {
            return { success: false, message: 'Network error during course update' };
        }
    };

    const deleteBlog = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                await fetchBlogs();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during blog deletion' };
        }
    };

    const deleteCourse = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                await fetchCourses();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during course deletion' };
        }
    };

    const deleteTeacher = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                await fetchTeachers();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during teacher deletion' };
        }
    };

    const deleteStudent = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/students/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                await fetchStudents();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during student deletion' };
        }
    };

    const deleteParent = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/parents/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (response.ok) {
                await fetchParents();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            return { success: false, message: 'Network error during parent deletion' };
        }
    };

    // Initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchTeachers();
            fetchStudents();
            fetchCourses();
            fetchBlogs();
            fetchParents();
            fetchAdminDashboardStats();
        }
    }, []);

    const value = {
        teachers,
        students,
        courses,
        blogs,
        parents,
        adminDashboardStats,
        loading,
        error,
        fetchTeachers,
        fetchStudents,
        fetchCourses,
        fetchBlogs,
        fetchParents,
        fetchAdminDashboardStats,
        registerTeacher,
        registerStudent,
        registerAdmin,
        registerParent,
        registerCourse,
        createBlog,
        updateBlog,
        updateCourse,
        deleteBlog,
        deleteCourse,
        deleteTeacher,
        deleteStudent,
        deleteParent
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
