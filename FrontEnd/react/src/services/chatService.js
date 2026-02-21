import apiClient from '../lib/apiClient';

export const chatService = {
    sendMessage: async (userMessage, history) => {
        const response = await apiClient.post('/chat', {
            message: userMessage,
            history: history
        });
        return response.data;
    }
};
