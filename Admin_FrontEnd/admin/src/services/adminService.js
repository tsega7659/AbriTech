import apiClient from '../lib/apiClient';

export const adminService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    },
    getAnalyticsData: async () => {
        const response = await apiClient.get('/admin/analytics');
        return response.data;
    },
    updateTeacherSpecialization: async (teacherId, specialization) => {
        const response = await apiClient.put(`/admin/teachers/${teacherId}/specialization`, { specialization });
        return response.data;
    },

    // Teachers
    getTeachers: async () => {
        const response = await apiClient.get('/teachers');
        return response.data;
    },
    registerTeacher: async (data) => {
        const response = await apiClient.post('/auth/register/teacher', data);
        return response.data;
    },
    deleteTeacher: async (id) => {
        const response = await apiClient.delete(`/teachers/${id}`);
        return response.data;
    },
    getInstructorDetails: async (id) => {
        const response = await apiClient.get(`/admin/instructors/${id}`);
        return response.data;
    },
    updateInstructorCourses: async (id, courseIds) => {
        const response = await apiClient.put(`/admin/instructors/${id}/courses`, { courseIds });
        return response.data;
    },

    // Students
    getStudents: async () => {
        const response = await apiClient.get('/students');
        return response.data;
    },
    registerStudent: async (data) => {
        const response = await apiClient.post('/auth/register/student', data);
        return response.data;
    },
    deleteStudent: async (id) => {
        const response = await apiClient.delete(`/students/${id}`);
        return response.data;
    },
    getStudentDetails: async (id) => {
        const response = await apiClient.get(`/admin/students/${id}`);
        return response.data;
    },

    // Courses
    getCourses: async () => {
        const response = await apiClient.get('/courses');
        return response.data;
    },
    createCourse: async (formData, onProgress) => {
        const response = await apiClient.post('/courses', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },
    updateCourse: async (id, formData, onProgress) => {
        const response = await apiClient.put(`/courses/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },
    deleteCourse: async (id) => {
        const response = await apiClient.delete(`/courses/${id}`);
        return response.data;
    },

    // Blogs
    getBlogs: async () => {
        const response = await apiClient.get('/blogs');
        return response.data;
    },
    createBlog: async (formData, onProgress) => {
        const response = await apiClient.post('/blogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },
    updateBlog: async (id, formData, onProgress) => {
        const response = await apiClient.put(`/blogs/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    },
    deleteBlog: async (id) => {
        const response = await apiClient.delete(`/blogs/${id}`);
        return response.data;
    },

    // Parents
    getParents: async () => {
        const response = await apiClient.get('/parents');
        return response.data;
    },
    registerParent: async (data) => {
        const response = await apiClient.post('/auth/register/parent', data);
        return response.data;
    },
    registerAdmin: async (data) => {
        const response = await apiClient.post('/auth/register/admin', data);
        return response.data;
    },
    deleteParent: async (id) => {
        const response = await apiClient.delete(`/parents/${id}`);
        return response.data;
    },
    getParentDetails: async (id) => {
        const response = await apiClient.get(`/admin/parents/${id}`);
        return response.data;
    },

    // Projects
    getProjects: async () => {
        const response = await apiClient.get('/admin/projects');
        return response.data;
    },
    reviewProject: async (id, assessmentData) => {
        const response = await apiClient.put(`/admin/projects/${id}/review`, assessmentData);
        return response.data;
    }
};
