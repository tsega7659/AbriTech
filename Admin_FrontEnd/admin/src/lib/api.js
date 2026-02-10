import { API_BASE_URL, getAuthHeaders } from '../config/apiConfig.js';

const api = {
    get: async (url) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw { response: { data: error, status: response.status } };
        }
        return { data: await response.json() };
    },
    post: async (url, data) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw { response: { data: error, status: response.status } };
        }
        return { data: await response.json() };
    }
};

export default api;
