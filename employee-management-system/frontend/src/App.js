// 导入React和路由相关组件
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 导入Material-UI主题相关组件
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 导入认证上下文
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 导入页面组件
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// 创建Material-UI主题
const theme = createTheme({
  // 调色板配置
  palette: {
    primary: {
      main: '#1976d2', // 主要颜色：蓝色
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // 次要颜色：红色
    },
    background: {
      default: '#f5f5f5', // 默认背景色
      paper: '#ffffff',   // 纸张背景色
    },
  },
  // 字体配置
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  // 组件样式覆盖
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 按钮文字不自动转大写
          borderRadius: 8,       // 圆角边框
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,     // 输入框圆角
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,      // 纸张组件圆角
        },
      },
    },
  },
});

// 受保护的路由组件 - 只有登录用户才能访问
const ProtectedRoute = ({ children }) => {
  // 获取认证状态
  const { isAuthenticated, loading } = useAuth();

  // 如果正在检查认证状态，显示加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  // 如果用户已认证，显示子组件；否则重定向到登录页
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 公共路由组件 - 已登录用户不能访问（如登录页）
const PublicRoute = ({ children }) => {
  // 获取认证状态
  const { isAuthenticated, loading } = useAuth();

  // 如果正在检查认证状态，显示加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  // 如果用户已认证，重定向到主页；否则显示子组件
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// 主应用组件
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline 提供一致的CSS基线 */}
      <CssBaseline />
      
      {/* 认证提供者包装整个应用 */}
      <AuthProvider>
        {/* 路由器配置 */}
        <Router>
          <Routes>
            {/* 根路径重定向到仪表板 */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            {/* 登录页路由 - 只有未登录用户可以访问 */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            
            {/* 仪表板路由 - 需要登录才能访问 */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404页面 - 处理未匹配的路由 */}
            <Route 
              path="*" 
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  backgroundColor: '#f5f5f5',
                  flexDirection: 'column'
                }}>
                  <h1>404 - 页面未找到</h1>
                  <p>抱歉，您访问的页面不存在。</p>
                </div>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
