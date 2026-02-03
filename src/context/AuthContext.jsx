import { createContext, useContext, useState, useEffect } from 'react';
import { usersAPI, notificationsAPI } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (user) {
            fetchUnreadCount();
            // Poll for new notifications every 60 seconds
            interval = setInterval(fetchUnreadCount, 60000);
        }
        return () => clearInterval(interval);
    }, [user]);

    const fetchUser = async () => {
        try {
            const response = await usersAPI.getMe();
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!localStorage.getItem('access_token')) return;
        try {
            const response = await notificationsAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const login = (tokens) => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setUnreadCount(0);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            unreadCount,
            login,
            logout,
            fetchUser,
            fetchUnreadCount,
            setUnreadCount
        }}>
            {children}
        </AuthContext.Provider>
    );
};

