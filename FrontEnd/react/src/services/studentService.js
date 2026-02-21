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
    }
};
