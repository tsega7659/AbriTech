import apiClient from '../lib/apiClient';

export const lessonService = {
    // Get all lessons for a course
    getLessons: async (courseId) => {
        const response = await apiClient.get(`/lessons/course/${courseId}`);
        return response.data.lessons || [];
    },

    // Create a new lesson (with progress tracking)
    createLesson: async (formData, onProgress) => {
        const response = await apiClient.post('/lessons', formData, {
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

    // Update a lesson (with progress tracking)
    updateLesson: async (id, formData, onProgress) => {
        const response = await apiClient.put(`/lessons/${id}`, formData, {
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

    // Delete a lesson
    deleteLesson: async (id) => {
        const response = await apiClient.delete(`/lessons/${id}`);
        return response.data;
    },

    // Mark lesson as complete (Student)
    markComplete: async (lessonId) => {
        const response = await apiClient.post(`/lessons/${lessonId}/complete`);
        return response.data;
    },

    // Submit quiz (Student)
    submitQuiz: async (lessonId, answers) => {
        const response = await apiClient.post(`/lessons/${lessonId}/quiz/submit`, { answers });
        return response.data;
    }
};
