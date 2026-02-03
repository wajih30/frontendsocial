import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
    },
    verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (email, otp, new_password) =>
        api.post('/auth/reset-password', { email, otp, new_password }),
};

// Users API
export const usersAPI = {
    getMe: () => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
    updatePassword: (currentPassword, newPassword) =>
        api.put('/users/me/password', { current_password: currentPassword, new_password: newPassword }),
    getUser: (username) => api.get(`/users/${username}`),

    search: (query, limit = 20) => api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// Social API
export const socialAPI = {
    getFeed: (skip = 0, limit = 50) => api.get(`/social/feed?skip=${skip}&limit=${limit}`),
    getPost: (postId) => api.get(`/social/${postId}`),
    getUserPosts: (userId, skip = 0, limit = 50) =>

        api.get(`/social/user/${userId}?skip=${skip}&limit=${limit}`),
    createPost: (data) => api.post('/social/', data),
    updatePost: (postId, data) => api.put(`/social/${postId}`, data),
    deletePost: (postId) => api.delete(`/social/${postId}`),
    likePost: (postId) => api.post(`/social/${postId}/like`),
    unlikePost: (postId) => api.delete(`/social/${postId}/like`),
    addComment: (postId, text) => api.post(`/social/${postId}/comment`, { comment_text: text }),
    deleteComment: (commentId) => api.delete(`/social/comments/${commentId}`),
    follow: (userId) => api.post(`/social/${userId}/follow`),
    unfollow: (userId) => api.delete(`/social/${userId}/follow`),
};

// Notifications API
export const notificationsAPI = {
    getNotifications: (skip = 0, limit = 20) =>
        api.get(`/notifications/?skip=${skip}&limit=${limit}`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.post(`/notifications/${id}/read`),
    markAllAsRead: () => api.post('/notifications/read-all'),
};


// Upload API
export const uploadAPI = {
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
