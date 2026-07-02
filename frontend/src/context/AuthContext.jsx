import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

const normalizeAuthMessage = (message, fallback) => {
  const normalized = String(message || '').trim();
  if (!normalized) return fallback;

  const dictionary = {
    'Incorrect username or password': 'Tên đăng nhập hoặc mật khẩu không đúng.',
    'User not found': 'Không tìm thấy tài khoản.',
    'Bad credentials': 'Tên đăng nhập hoặc mật khẩu không đúng.',
    'User account is locked': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ S-LIFE.',
    'Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ S-LIFE.',
    'User is disabled': 'Tài khoản của bạn đã bị vô hiệu hóa.',
    'Account has been disabled': 'Tài khoản của bạn đã bị vô hiệu hóa.',
    'Username already exists': 'Tên đăng nhập đã được sử dụng.',
    'Email already exists': 'Email đã được sử dụng.',
    'Username is required': 'Vui lòng nhập tên đăng nhập.',
    'Email is required': 'Vui lòng nhập email.',
    'Email should be valid': 'Email không đúng định dạng.',
    'Password is required': 'Vui lòng nhập mật khẩu.',
    'Password must be at least 8 characters long': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'OAuth2 authentication failed': 'Đăng nhập Google thất bại.'
  };

  return dictionary[normalized] || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      // Backend returns LoginResponse { token, type, role, username }
      const { token, ...userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: normalizeAuthMessage(
          error.response?.data?.message,
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        )
      };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: normalizeAuthMessage(
          error.response?.data?.message,
          'Đăng ký thất bại. Vui lòng thử lại.'
        )
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser((currentUser) => {
      const updatedUser = { ...(currentUser || {}), ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = useMemo(() => ({
    user, setUser, loading, login, register, logout, loginWithToken, updateUser
  }), [user, loading, login, register, logout, loginWithToken, updateUser]);

  return (
    <AuthContext.Provider value={value}>
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
