import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { lessonService } from '../services/lessonService';
import apiClient from '../lib/apiClient';

// --- Queries ---

export const useProfile = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/auth/me');
            return response.data;
        }
    });
};

export const useAdminDashboardStats = () => {
    return useQuery({
        queryKey: ['admin', 'dashboard'],
        queryFn: adminService.getDashboardStats
    });
};

export const useAdminAnalytics = () => {
    return useQuery({
        queryKey: ['admin', 'analytics'],
        queryFn: adminService.getAnalyticsData
    });
};

export const useTeachers = () => {
    return useQuery({
        queryKey: ['admin', 'teachers'],
        queryFn: adminService.getTeachers
    });
};

export const useStudentsList = () => {
    return useQuery({
        queryKey: ['admin', 'students'],
        queryFn: adminService.getStudents
    });
};

export const useAdminCourses = () => {
    return useQuery({
        queryKey: ['admin', 'courses'],
        queryFn: adminService.getCourses
    });
};

export const useAdminBlogs = () => {
    return useQuery({
        queryKey: ['admin', 'blogs'],
        queryFn: adminService.getBlogs
    });
};

export const useParents = () => {
    return useQuery({
        queryKey: ['admin', 'parents'],
        queryFn: adminService.getParents
    });
};

export const useLessons = (courseId) => {
    return useQuery({
        queryKey: ['admin', 'lessons', courseId],
        queryFn: () => lessonService.getLessons(courseId),
        enabled: !!courseId
    });
};

// --- Mutations ---

// Teachers
export const useRegisterTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.registerTeacher,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] })
    });
};

export const useDeleteTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.deleteTeacher,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'teachers'] })
    });
};

// Students
export const useRegisterStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.registerStudent,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    });
};

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.deleteStudent,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    });
};

// Courses
export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formData, onProgress }) => adminService.createCourse(formData, onProgress),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData, onProgress }) => adminService.updateCourse(id, formData, onProgress),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.deleteCourse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    });
};

// Blogs
export const useCreateBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formData, onProgress }) => adminService.createBlog(formData, onProgress),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] })
    });
};

export const useUpdateBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData, onProgress }) => adminService.updateBlog(id, formData, onProgress),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] })
    });
};

export const useDeleteBlog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.deleteBlog,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] })
    });
};

// Parents
export const useRegisterParent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.registerParent,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'parents'] })
    });
};

export const useRegisterAdmin = () => {
    return useMutation({
        mutationFn: adminService.registerAdmin
    });
};

export const useDeleteParent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminService.deleteParent,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'parents'] })
    });
};

// Lessons
export const useCreateLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ formData, onProgress }) => lessonService.createLesson(formData, onProgress),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', variables.formData.get('courseId')] });
        }
    });
};

export const useUpdateLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, formData, onProgress }) => lessonService.updateLesson(id, formData, onProgress),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', variables.formData.get('courseId')] });
        }
    });
};

export const useDeleteLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, courseId }) => lessonService.deleteLesson(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'lessons', variables.courseId] });
        }
    });
};
