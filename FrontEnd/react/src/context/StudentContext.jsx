import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudentData = useCallback(async (force = false) => {
        if (!user || user.role !== 'student') return;

        // If data already exists and not forcing, don't fetch
        if (!force && enrolledCourses.length > 0 && dashboardStats) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [statsResponse, coursesResponse] = await Promise.all([
                api.get('/students/dashboard'),
                api.get('/students/courses')
            ]);

            setDashboardStats(statsResponse.data);
            setEnrolledCourses(coursesResponse.data);
        } catch (err) {
            const message = err.response?.data?.message || "Failed to load dashboard data. Please try again later.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Initial fetch when user changes or on mount
    useEffect(() => {
        if (user && user.role === 'student') {
            fetchStudentData();
        } else {
            // Clear data if user logs out or is not a student
            setEnrolledCourses([]);
            setDashboardStats(null);
            setLoading(false);
        }
    }, [user, fetchStudentData]);

    const updateLocalCourseProgress = (courseId, newProgress) => {
        setEnrolledCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === parseInt(courseId)
                    ? { ...course, progress: newProgress }
                    : course
            )
        );

        // Also update stats if needed (lessons completed)
        // This is a bit complex as we don't know the exact lesson count here
        // but it's better than nothing.
    };

    const fetchAssignments = async (courseId) => {
        try {
            const response = await api.get(`/assignments?courseId=${courseId}`);
            return response.data;
        } catch (err) {
            console.error("Failed to fetch assignments:", err);
            return [];
        }
    };

    const refreshDashboardData = () => fetchStudentData(true);

    return (
        <StudentContext.Provider value={{
            enrolledCourses,
            dashboardStats,
            loading,
            error,
            refreshDashboardData,
            updateLocalCourseProgress,
            fetchAssignments
        }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
};
