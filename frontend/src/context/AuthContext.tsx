"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            try {
                const response = await api.get('/user');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('token');
                setToken(null);
            }
        }
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        try {
            console.log('AuthContext - Attempting login...');
            const response = await api.post('/login', { email, password });
            console.log('AuthContext - Login response:', response.data);

            // Handle different response formats
            const newToken = response.data.token || response.data.access_token || response.data.data?.token;
            const userData = response.data.user || response.data.data?.user;

            console.log('AuthContext - Extracted token:', newToken ? 'EXISTS' : 'MISSING');
            console.log('AuthContext - Extracted user:', userData);

            if (!newToken) {
                throw new Error('No token received from server');
            }

            localStorage.setItem('token', newToken);
            setToken(newToken);
            console.log('AuthContext - Token saved to localStorage');

            // Also set cookie for middleware
            document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
            console.log('AuthContext - Token saved to cookie');

            // Store user role in cookie for middleware
            if (userData?.role) {
                document.cookie = `user_role=${userData.role}; path=/; max-age=86400; SameSite=Lax`;
                console.log('AuthContext - User role saved to cookie:', userData.role);
            }

            setUser(userData);
            console.log('AuthContext - Login complete');
            // Don't redirect here - let the calling component handle navigation
        } catch (error: any) {
            console.error('AuthContext - Login error:', error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.post('/register', { name, email, password, password_confirmation: password });
        const newToken = response.data.token || response.data.access_token;
        const userData = response.data.user;

        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // Also set cookie for middleware
            document.cookie = `token=${newToken}; path=/; max-age=86400`; // 24 hours
            setUser(userData);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        }
        localStorage.removeItem('token');
        setToken(null);
        // Clear cookies
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'user_role=; path=/; max-age=0';
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
