import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
    const { user } = useAuth();
    const [linkedStudents, setLinkedStudents] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchParentData = useCallback(async (force = false) => {
        if (!user || user.role !== 'parent') return;

        if (!force && linkedStudents.length > 0 && dashboardStats) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [statsResponse, studentsResponse] = await Promise.all([
                api.get('/parents/dashboard'),
                api.get('/parents/linked-students')
            ]);

            setDashboardStats(statsResponse.data);
            setLinkedStudents(studentsResponse.data);
        } catch (err) {
            const message = err.response?.data?.message || "Failed to load dashboard data. Please try again later.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user && user.role === 'parent') {
            fetchParentData();
        } else {
            setLinkedStudents([]);
            setDashboardStats(null);
            setLoading(false);
        }
    }, [user, fetchParentData]);

    const refreshParentData = () => fetchParentData(true);

    return (
        <ParentContext.Provider value={{
            linkedStudents,
            dashboardStats,
            loading,
            error,
            refreshParentData
        }}>
            {children}
        </ParentContext.Provider>
    );
};

export const useParent = () => {
    const context = useContext(ParentContext);
    if (!context) {
        throw new Error('useParent must be used within a ParentProvider');
    }
    return context;
};
