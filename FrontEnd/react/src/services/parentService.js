import apiClient from '../lib/apiClient';

const parentService = {
    getDashboardStats: async () => {
        const response = await apiClient.get('/parents/dashboard');
        return response.data;
    },

    getLinkedStudents: async () => {
        const response = await apiClient.get('/parents/linked-students');
        return response.data;
    },
    getDetailedProgress: async (studentId, courseId) => {
        const response = await apiClient.get(`/parents/progress/${studentId}/${courseId}`);
        return response.data;
    }
};

export default parentService;
