import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Load user data on mount if token exists
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    // You might have a /me endpoint to verify token and get user details
                    // For now, we'll decode the token or use stored user data
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            return { success: false, message };
        }
    };

    const register = async (type, data) => {
        try {
            const endpoint = type === 'student' ? '/auth/register/student' : '/auth/register/parent';
            const response = await api.post(endpoint, data);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const linkStudent = async (referralCode) => {
        try {
            const response = await api.post('/parents/link-student', { referralCode });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to link student. Please check the code.';
            return { success: false, message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, linkStudent }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
