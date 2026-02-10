import api from '../lib/api';

export const lessonService = {
    // Get lessons for a course (Student View - with progress)
    getLessons: async (courseId) => {
        try {
            const response = await api.get(`/lessons/course/${courseId}`);
            return response.data; // { lessons: [...] }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            throw error;
        }
    },

    // Mark lesson as complete
    markComplete: async (lessonId) => {
        try {
            await api.post(`/lessons/${lessonId}/complete`);
            return true;
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            throw error;
        }
    },

    // Submit quiz answers
    submitQuiz: async (lessonId, answers) => {
        try {
            const response = await api.post(`/lessons/${lessonId}/quiz/submit`, { answers });
            return response.data; // { passed: true/false, correctCount: X, totalQuestions: Y, ... }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw error;
        }
    }
};
