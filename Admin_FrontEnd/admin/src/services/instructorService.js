import apiClient from '../lib/apiClient';

export const instructorService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        const response = await apiClient.get('/teachers/dashboard');
        return response.data;
    },

    // Courses
    getCourses: async () => {
        const response = await apiClient.get('/teachers/courses');
        return response.data;
    },

    // Students
    getStudents: async () => {
        const response = await apiClient.get('/teachers/students');
        return response.data;
    },

    // Course specific students
    getCourseStudents: async (courseId) => {
        const response = await apiClient.get(`/teachers/students?courseId=${courseId}`);
        return response.data;
    },

    // Student course detail
    getStudentCourseDetail: async (studentId, courseId) => {
        const response = await apiClient.get(`/teachers/students/${studentId}/course/${courseId}`);
        return response.data;
    },

    // Submissions
    getSubmissions: async () => {
        const response = await apiClient.get('/teachers/submissions');
        return response.data;
    },

    // Assess submission
    assessSubmission: async ({ id, assessmentData }) => {
        const response = await apiClient.post(`/assignments/submissions/${id}/assess`, assessmentData);
        return response.data;
    },

    // Add course project (assignment)
    addCourseProject: async (projectData) => {
        const response = await apiClient.post('/assignments', projectData);
        return response.data;
    }
};
