const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
    ? 'http://localhost:5000/api'
    : 'https://abritech.onrender.com/api';

console.log(`[API Config] Mode: ${isDev ? 'Development' : 'Production'}`);
console.log(`[API Config] Base URL: ${API_BASE_URL}`);

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
};
