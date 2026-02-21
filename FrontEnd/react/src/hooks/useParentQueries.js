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
