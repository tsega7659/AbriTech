import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

export const blogService = {
    getAllBlogs: async () => {
        const response = await apiClient.get('/blogs');
        return response.data;
    },
    getBlogById: async (id) => {
        const response = await apiClient.get(`/blogs/${id}`);
        return response.data;
    }
};

export const useBlogs = () => {
    return useQuery({
        queryKey: ['blogs'],
        queryFn: blogService.getAllBlogs,
    });
};

export const useBlogDetail = (id) => {
    return useQuery({
        queryKey: ['blog', id],
        queryFn: () => blogService.getBlogById(id),
        enabled: !!id,
    });
};
