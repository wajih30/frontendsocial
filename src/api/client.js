import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {},
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
// Handle 401 errors and Token Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried
        const isAuthRequest = originalRequest.url.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Call refresh endpoint
                // Note: backend expects refresh_token as query param based on signature
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh?refresh_token=${refreshToken}`
                );

                const { access_token, refresh_token: newRefreshToken } = response.data;

                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', newRefreshToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
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
    createComment: (postId, text) => api.post(`/social/${postId}/comment`, { comment_text: text }),
    deleteComment: (commentId) => api.delete(`/social/comments/${commentId}`),
    follow: (userId) => api.post(`/social/${userId}/follow`),
    unfollow: (userId) => api.delete(`/social/${userId}/follow`),
    getFollowers: (userId) => api.get(`/social/${userId}/followers`),
    getFollowing: (userId) => api.get(`/social/${userId}/following`),
};

// Notifications API
export const notificationsAPI = {
    getNotifications: (skip = 0, limit = 20) =>
        api.get(`/notifications/?skip=${skip}&limit=${limit}`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAllAsRead: () => api.post('/notifications/read-all'),
};


// Upload API
export const uploadAPI = {
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/', formData);
    },
};

// AI API
export const aiAPI = {
    generateBio: (keywords) => api.post('/ai/generate-bio', { keywords }),
};


export default api;
