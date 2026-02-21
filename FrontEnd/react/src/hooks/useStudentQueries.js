import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import { lessonService } from '../services/lessonService';
import apiClient from '../lib/apiClient';

export const useStudentDashboard = () => {
    return useQuery({
        queryKey: ['student', 'dashboard'],
        queryFn: studentService.getDashboardStats
    });
};

export const useAllCourses = () => {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const response = await apiClient.get('/courses');
            return response.data;
        }
    });
};

export const useGrades = () => {
    return useQuery({
        queryKey: ['student', 'grades'],
        queryFn: async () => {
            const response = await apiClient.get('/students/grades');
            return response.data;
        }
    });
};

export const useEnrolledCourses = () => {
    return useQuery({
        queryKey: ['student', 'courses'],
        queryFn: studentService.getEnrolledCourses
    });
};

export const useAssignments = (courseId) => {
    return useQuery({
        queryKey: ['student', 'assignments', courseId],
        queryFn: () => studentService.getAssignments(courseId),
        enabled: !!courseId
    });
};

export const useLessons = (courseId) => {
    return useQuery({
        queryKey: ['student', 'lessons', courseId],
        queryFn: () => lessonService.getLessons(courseId),
        enabled: !!courseId
    });
};

export const useCompleteLesson = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (lessonId) => lessonService.markComplete(lessonId),
        onSuccess: (_, lessonId) => {
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'lessons'] });
        }
    });
};

export const useSubmitQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ lessonId, answers }) => lessonService.submitQuiz(lessonId, answers),
        onSuccess: (_, { lessonId }) => {
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'lessons'] });
        }
    });
};

export const useSubmitAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, formData, onProgress }) => {
            return apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                }
            });
        },
        onSuccess: (_, { assignmentId }) => {
            queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] });
        }
    });
};
