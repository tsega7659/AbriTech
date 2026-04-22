import { useQuery } from '@tanstack/react-query';
import parentService from '../services/parentService';

export const useParentDashboardStats = () => {
    return useQuery({
        queryKey: ['parent', 'dashboard'],
        queryFn: parentService.getDashboardStats
    });
};

export const useLinkedStudents = () => {
    return useQuery({
        queryKey: ['parent', 'linked-students'],
        queryFn: parentService.getLinkedStudents
    });
};
export const useParentMonthlyReport = () => {
    return useQuery({
        queryKey: ['parent', 'monthly-report'],
        queryFn: parentService.getMonthlyReport
    });
};

export const useDetailedProgress = (studentId, courseId) => {
    return useQuery({
        queryKey: ['parent', 'progress', studentId, courseId],
        queryFn: () => parentService.getDetailedProgress(studentId, courseId),
        enabled: !!studentId && !!courseId
    });
};