// 导入React相关hooks和API服务
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentAdmin } from '../services/api';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件 - 管理用户登录状态和相关方法
export const AuthProvider = ({ children }) => {
  // 用户状态：存储当前登录的管理员信息
  const [admin, setAdmin] = useState(null);
  
  // 加载状态：表示是否正在检查用户认证状态
  const [loading, setLoading] = useState(true);
  
  // 认证状态：表示用户是否已登录
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 组件挂载时检查本地存储的token，验证用户是否已登录
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 检查认证状态的函数
  const checkAuthStatus = async () => {
    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      const savedAdmin = localStorage.getItem('admin');

      if (token && savedAdmin) {
        // 如果token和用户信息都存在，尝试验证token有效性
        try {
          // 调用API验证token是否有效
          const response = await getCurrentAdmin();
          if (response.success) {
            // token有效，设置用户信息和认证状态
            setAdmin(response.data);
            setIsAuthenticated(true);
          } else {
            // token无效，清除本地数据
            clearAuthData();
          }
        } catch (error) {
          // API调用失败，可能是网络问题或token过期
          console.error('验证token失败:', error);
          clearAuthData();
        }
      } else {
        // 没有token或用户信息，用户未登录
        clearAuthData();
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      clearAuthData();
    } finally {
      // 无论成功还是失败，都结束加载状态
      setLoading(false);
    }
  };

  // 清除认证数据的函数
  const clearAuthData = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  };

  // 登录函数 - 保存用户信息和token
  const login = (adminData, token) => {
    try {
      // 将token和用户信息保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      
      // 更新状态
      setAdmin(adminData);
      setIsAuthenticated(true);
      
      console.log('用户登录成功:', adminData.username);
    } catch (error) {
      console.error('保存登录信息失败:', error);
    }
  };

  // 登出函数 - 清除所有用户信息
  const logout = () => {
    try {
      console.log('用户登出:', admin?.username);
      clearAuthData();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 更新用户信息函数 - 用于修改个人信息后更新本地状态
  const updateAdmin = (updatedAdminData) => {
    try {
      // 更新localStorage中的用户信息
      localStorage.setItem('admin', JSON.stringify(updatedAdminData));
      
      // 更新状态
      setAdmin(updatedAdminData);
      
      console.log('用户信息已更新:', updatedAdminData.username);
    } catch (error) {
      console.error('更新用户信息失败:', error);
    }
  };

  // 刷新用户信息函数 - 从服务器重新获取最新的用户信息
  const refreshAdmin = async () => {
    try {
      if (isAuthenticated) {
        const response = await getCurrentAdmin();
        if (response.success) {
          updateAdmin(response.data);
          return response.data;
        }
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      // 如果刷新失败，可能是token过期，执行登出
      logout();
    }
  };

  // 检查用户权限的函数（可扩展用于角色权限控制）
  const hasPermission = (permission) => {
    // 目前所有登录用户都有相同权限
    // 将来可以根据用户角色来判断权限
    return isAuthenticated;
  };

  // Context提供的值对象
  const contextValue = {
    // 状态数据
    admin,                // 当前登录的管理员信息
    loading,              // 是否正在加载认证状态
    isAuthenticated,      // 是否已认证（登录）
    
    // 方法函数
    login,                // 登录方法
    logout,               // 登出方法
    updateAdmin,          // 更新用户信息方法
    refreshAdmin,         // 刷新用户信息方法
    checkAuthStatus,      // 检查认证状态方法
    hasPermission,        // 权限检查方法
  };

  // 返回Context Provider，将状态和方法传递给子组件
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook - 用于在组件中方便地使用认证上下文
export const useAuth = () => {
  // 获取认证上下文
  const context = useContext(AuthContext);
  
  // 检查是否在AuthProvider范围内使用
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  
  return context;
};

// 导出认证上下文，供其他地方直接使用
export default AuthContext;