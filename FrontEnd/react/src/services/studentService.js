import apiClient from '../lib/apiClient';

export const studentService = {
    getDashboardStats: async () => {
        const response = await apiClient.get('/students/dashboard');
        return response.data;
    },
    getEnrolledCourses: async () => {
        const response = await apiClient.get('/students/courses');
        return response.data;
    },
    getAssignments: async (courseId) => {
        const response = await apiClient.get(`/assignments?courseId=${courseId}`);
        return response.data;
    },
    getAnalytics: async () => {
        const response = await apiClient.get('/students/analytics');
        return response.data;
    },
    getPortfolioData: async () => {
        const response = await apiClient.get('/students/portfolio');
        return response.data;
    },
    updateProfile: async (formData) => {
        const response = await apiClient.put('/students/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getCourseAnalytics: async (courseId) => {
        const response = await apiClient.get(`/students/courses/${courseId}/analytics`);
        return response.data;
    }
};
