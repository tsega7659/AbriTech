import { API_BASE_URL, getAuthHeaders } from '../config/apiConfig';

export const lessonService = {
    // Get all lessons for a course
    getLessons: async (courseId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/lessons/course/${courseId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return { success: response.ok, data: data.lessons || [], message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Create a new lesson
    createLesson: async (formData) => {
        try {
            // Note: When sending FormData, do NOT set Content-Type header manually, let browser set boundary
            const headers = getAuthHeaders();
            delete headers['Content-Type'];

            const response = await fetch(`${API_BASE_URL}/lessons`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            const data = await response.json();
            return { success: response.ok, data: data.lesson, message: data.message || 'Lesson created' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Update a lesson
    updateLesson: async (id, formData) => {
        try {
            const headers = getAuthHeaders();
            delete headers['Content-Type'];

            const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
                method: 'PUT',
                headers: headers,
                body: formData
            });
            const data = await response.json();
            return { success: response.ok, data: data.lesson, message: data.message || 'Lesson updated' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Delete a lesson
    deleteLesson: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return { success: response.ok, message: data.message || 'Lesson deleted' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};
