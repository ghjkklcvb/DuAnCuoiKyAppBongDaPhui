import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

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

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('🔐 AuthContext: checkAuth() called');
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.log('⚠️ AuthContext: No access token found');
                setLoading(false);
                return;
            }

            console.log('📞 AuthContext: Fetching user profile...');
            const userData = await authService.getProfile();
            console.log('✅ AuthContext: User profile fetched successfully:', userData.username);
            setUser(userData);
        } catch (error: any) {
            console.error('❌ AuthContext: Auth check failed:', error.message);
            
            if (!error.response) {
                if (error.message === 'Network Error') {
                    console.log('🌐 AuthContext: Network error - no internet connection or server unreachable');
                } else if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
                    console.log('⏱️ AuthContext: Auth check timeout - server may be slow');
                } else if (error.name === 'AuthenticationError') {
                    console.log('🚪 AuthContext: Auth error from interceptor - tokens already cleared');
                    setUser(null);
                } else {
                    console.log('❓ AuthContext: Auth check failed with unknown error:', error.message);
                }

            } else if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('🔒 AuthContext: Token invalid (401/403), clearing auth data');
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                setUser(null);
            } else if (error.message === 'Authentication failed') {
                console.log('🚪 AuthContext: Authentication failed, tokens cleared by interceptor');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await authService.login({ email, password });
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (username: string, email: string, password: string) => {
        await authService.register({ username, email, password });
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);

        } finally {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            setUser(null);

            queryClient.clear();
        }
    };

    const updateUser = (userData: User) => {
        console.log('🔄 AuthContext: updateUser() called with:', userData);
        setUser(userData);
        console.log('✅ AuthContext: User state updated');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);