import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { MESSAGES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    if (isAuth && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔥 AuthContext.login() called with:', credentials);
      const response = await authService.login(credentials);
      console.log('🔥 AuthContext received response:', response);
      console.log('🔥 Setting user:', response.user);
      console.log('🔥 Has accessToken?', !!response.accessToken);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(MESSAGES.SUCCESS.LOGIN);
      return response;
    } catch (error) {
      console.error('🔥 AuthContext.login() error:', error);
      toast.error(error.message || MESSAGES.ERROR.LOGIN);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(MESSAGES.SUCCESS.REGISTER);
      return response;
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.REGISTER);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success(MESSAGES.SUCCESS.LOGOUT);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.user);
      toast.success(MESSAGES.SUCCESS.UPDATE_PROFILE);
      return response;
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.UPDATE_PROFILE);
      throw error;
    }
  };

  const changePassword = async (data) => {
    try {
      await authService.changePassword(data);
      toast.success(MESSAGES.SUCCESS.CHANGE_PASSWORD);
    } catch (error) {
      toast.error(error.message || MESSAGES.ERROR.CHANGE_PASSWORD);
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
