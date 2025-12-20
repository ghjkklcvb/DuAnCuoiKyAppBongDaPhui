import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { useToast } from '../hooks/useToast';

interface User {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
    phone?: string;
    avatar: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const toast = useToast();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error: any) {
            if (!error.response) {
                if (error.message === 'Network Error') {
                    toast.showError('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng kiểm tra mạng.');
                } else if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
                    toast.showError('Lỗi kết nối', 'Kết nối quá chậm. Vui lòng thử lại.');
                } else if (error.name === 'AuthenticationError') {
                    toast.showError('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.');
                    setUser(null);
                } else {
                    toast.showError('Lỗi xác thực', error.message || 'Đã xảy ra lỗi không xác định.');
                }
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                toast.showError('Phiên đăng nhập hết hạn', 'Token không hợp lệ. Vui lòng đăng nhập lại.');
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                setUser(null);
            } else if (error.message === 'Authentication failed') {
                toast.showError('Xác thực thất bại', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await authService.login({ email, password });
        const userData = await authService.getProfile();
        setUser(userData);
    };

    const register = async (username: string, email: string, password: string) => {
        await authService.register({ username, email, password });
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            toast.showError('Lỗi đăng xuất', 'Không thể đăng xuất từ server, nhưng đã xóa phiên đăng nhập local.');
        } finally {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            setUser(null);
            queryClient.clear();
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);