import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const InstructorContext = createContext();

export const InstructorProvider = ({ children }) => {
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInstructorData = useCallback(async (force = false) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || user.role !== 'teacher') {
            setLoading(false);
            return;
        }

        if (!force && assignedCourses.length > 0 && dashboardStats && students.length > 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const [statsRes, coursesRes, studentsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/teachers/dashboard`, { headers }),
                fetch(`${API_BASE_URL}/teachers/courses`, { headers }),
                fetch(`${API_BASE_URL}/teachers/students`, { headers })
            ]);

            if (statsRes.ok && coursesRes.ok && studentsRes.ok) {
                const stats = await statsRes.json();
                const coursesData = await coursesRes.json();
                const studentsData = await studentsRes.json();
                setDashboardStats(stats);
                setAssignedCourses(coursesData);
                setStudents(studentsData);
            } else {
                setError('Failed to fetch instructor dashboard data');
            }
        } catch (err) {
            console.error("Failed to fetch instructor data:", err);
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstructorData();
    }, [fetchInstructorData]);

    const refreshInstructorData = () => fetchInstructorData(true);

    const fetchCourseStudents = async (courseId) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/teachers/students?courseId=${courseId}`, { headers });
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (err) {
            console.error("Failed to fetch course students:", err);
            return [];
        }
    };

    const fetchStudentCourseDetail = async (studentId, courseId) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/teachers/students/${studentId}/course/${courseId}`, { headers });
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (err) {
            console.error("Failed to fetch student course detail:", err);
            return null;
        }
    };

    const addCourseProject = async (courseId, projectData) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            // Reusing existing API structure if possible, otherwise we might need a specific teacher endpoint
            const response = await fetch(`${API_BASE_URL}/assignments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    courseId,
                    ...projectData
                })
            });
            return response.ok;
        } catch (err) {
            console.error("Failed to add course project:", err);
            return false;
        }
    };

    return (
        <InstructorContext.Provider value={{
            assignedCourses,
            students,
            dashboardStats,
            loading,
            error,
            refreshInstructorData,
            fetchCourseStudents,
            fetchStudentCourseDetail,
            addCourseProject
        }}>
            {children}
        </InstructorContext.Provider>
    );
};

export const useInstructor = () => {
    const context = useContext(InstructorContext);
    if (!context) {
        throw new Error('useInstructor must be used within an InstructorProvider');
    }
    return context;
};
