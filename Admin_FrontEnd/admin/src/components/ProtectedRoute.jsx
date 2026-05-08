import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-slate-50">
                <Loader message="Verifying session..." />
            </div>
        );
    }

    if (!token || !user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to home or a specific error page if role not allowed
        // If they are a teacher trying to see admin, send them to instructor dashboard
        if (user.role === 'teacher') {
            return <Navigate to="/instructor/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
