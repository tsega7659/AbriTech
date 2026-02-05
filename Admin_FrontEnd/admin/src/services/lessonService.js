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

    // Helper for XHR requests to track progress
    xhrRequest: (url, method, data, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);

            // Set Headers
            const headers = getAuthHeaders();
            const isFormData = data instanceof FormData;

            Object.keys(headers).forEach(key => {
                if (isFormData && key === 'Content-Type') return; // Let browser set boundary
                xhr.setRequestHeader(key, headers[key]);
            });

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
                    resolve({ success: true, data: responseData.lesson || responseData, message: responseData.message });
                } else {
                    resolve({ success: false, message: responseData.message || 'Request failed' });
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error'));
            };

            xhr.send(isFormData ? data : JSON.stringify(data));
        });
    },

    // Create a new lesson
    createLesson: async (formData, onProgress) => {
        try {
            return await lessonService.xhrRequest(`${API_BASE_URL}/lessons`, 'POST', formData, onProgress);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Update a lesson
    updateLesson: async (id, formData, onProgress) => {
        try {
            return await lessonService.xhrRequest(`${API_BASE_URL}/lessons/${id}`, 'PUT', formData, onProgress);
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
