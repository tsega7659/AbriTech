import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorService } from '../services/instructorService';
import apiClient from '../lib/apiClient';

// --- Queries ---

export const useInstructorDashboardStats = () => {
    return useQuery({
        queryKey: ['instructor', 'dashboard'],
        queryFn: instructorService.getDashboardStats
    });
};

export const useInstructorCourses = () => {
    return useQuery({
        queryKey: ['instructor', 'courses'],
        queryFn: instructorService.getCourses
    });
};

export const useInstructorStudents = () => {
    return useQuery({
        queryKey: ['instructor', 'students'],
        queryFn: instructorService.getStudents
    });
};

export const useCourseStudents = (courseId) => {
    return useQuery({
        queryKey: ['instructor', 'course-students', courseId],
        queryFn: () => instructorService.getCourseStudents(courseId),
        enabled: !!courseId
    });
};

export const useStudentCourseDetail = (studentId, courseId) => {
    return useQuery({
        queryKey: ['instructor', 'student-detail', studentId, courseId],
        queryFn: () => instructorService.getStudentCourseDetail(studentId, courseId),
        enabled: !!studentId && !!courseId
    });
};

export const useInstructorSubmissions = () => {
    return useQuery({
        queryKey: ['instructor', 'submissions'],
        queryFn: instructorService.getSubmissions
    });
};

// --- Mutations ---

export const useAddProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: instructorService.addCourseProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
        }
    });
};

export const useAssessSubmission = (studentId, courseId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: instructorService.assessSubmission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructor', 'submissions'] });
            if (studentId && courseId) {
                queryClient.invalidateQueries({ queryKey: ['instructor', 'student-detail', studentId, courseId] });
            }
            queryClient.invalidateQueries({ queryKey: ['instructor', 'dashboard'] });
        }
    });
};
