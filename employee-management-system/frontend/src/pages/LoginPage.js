// 导入React hooks和Material-UI组件
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,           // 容器组件
  Paper,              // 纸张效果容器
  TextField,          // 输入框组件
  Button,             // 按钮组件
  Typography,         // 文本组件
  Box,                // 盒子布局组件
  Alert,              // 警告信息组件
  Tabs,               // 标签页组件
  Tab,                // 标签页项组件
  CircularProgress,   // 加载指示器
  InputAdornment,     // 输入框装饰
  IconButton,         // 图标按钮
} from '@mui/material';

// 导入Material-UI图标
import {
  Visibility,         // 显示密码图标
  VisibilityOff,      // 隐藏密码图标
  PersonAdd,          // 注册图标
  Login,              // 登录图标
} from '@mui/icons-material';

// 导入认证上下文和API服务
import { useAuth } from '../contexts/AuthContext';
import { login, register } from '../services/api';

// 登录页面组件
const LoginPage = () => {
  // 获取路由导航函数
  const navigate = useNavigate();
  
  // 获取认证上下文中的登录方法
  const { login: authLogin } = useAuth();

  // 当前活动的标签页（0=登录，1=注册）
  const [activeTab, setActiveTab] = useState(0);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  
  // 错误信息
  const [error, setError] = useState('');
  
  // 成功信息
  const [success, setSuccess] = useState('');
  
  // 密码显示/隐藏状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 登录表单数据
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // 注册表单数据
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });

  // 处理标签页切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');        // 清除错误信息
    setSuccess('');      // 清除成功信息
  };

  // 处理登录表单输入变化
  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理注册表单输入变化
  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理登录表单提交
  const handleLoginSubmit = async (event) => {
    event.preventDefault(); // 阻止表单默认提交行为
    
    // 清除之前的错误信息
    setError('');
    setLoading(true);

    try {
      // 验证表单数据
      if (!loginForm.username.trim() || !loginForm.password.trim()) {
        throw new Error('请填写用户名和密码');
      }

      // 调用登录API
      const response = await login({
        username: loginForm.username.trim(),
        password: loginForm.password
      });

      if (response.success) {
        // 登录成功，保存用户信息和token
        authLogin(response.data.admin, response.data.token);
        
        // 跳转到主页面
        navigate('/dashboard', { replace: true });
      } else {
        // 登录失败，显示错误信息
        setError(response.message || '登录失败');
      }
    } catch (error) {
      // 处理登录错误
      console.error('登录错误:', error);
      setError(error.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册表单提交
  const handleRegisterSubmit = async (event) => {
    event.preventDefault(); // 阻止表单默认提交行为
    
    // 清除之前的信息
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 验证表单数据
      const { username, password, confirmPassword, email, fullName } = registerForm;
      
      if (!username.trim() || !password.trim() || !email.trim() || !fullName.trim()) {
        throw new Error('请填写所有必填字段');
      }

      if (password !== confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      if (password.length < 6) {
        throw new Error('密码长度至少为6位');
      }

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      // 调用注册API
      const response = await register({
        username: username.trim(),
        password: password,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim()
      });

      if (response.success) {
        // 注册成功
        setSuccess('注册成功！请使用新账户登录。');
        
        // 清空注册表单
        setRegisterForm({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          fullName: ''
        });
        
        // 2秒后自动切换到登录标签页
        setTimeout(() => {
          setActiveTab(0);
          setSuccess('');
        }, 2000);
      } else {
        // 注册失败
        setError(response.message || '注册失败');
      }
    } catch (error) {
      // 处理注册错误
      console.error('注册错误:', error);
      setError(error.message || '注册失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 切换密码显示状态
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 切换确认密码显示状态
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={6}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          width: '100%'
        }}
      >
        {/* 页面标题 */}
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          员工管理系统
        </Typography>

        {/* 标签页导航 */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            centered
            variant="fullWidth"
          >
            <Tab 
              label="登录" 
              icon={<Login />}
              iconPosition="start"
            />
            <Tab 
              label="注册" 
              icon={<PersonAdd />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* 错误信息显示 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ width: '100%', mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* 成功信息显示 */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ width: '100%', mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {/* 登录表单 */}
        {activeTab === 0 && (
          <Box 
            component="form" 
            onSubmit={handleLoginSubmit}
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={loginForm.username}
              onChange={handleLoginChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={handleLoginChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="切换密码显示"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Login />}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Box>
        )}

        {/* 注册表单 */}
        {activeTab === 1 && (
          <Box 
            component="form" 
            onSubmit={handleRegisterSubmit}
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="姓名"
              name="fullName"
              autoComplete="name"
              autoFocus
              value={registerForm.fullName}
              onChange={handleRegisterChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="reg-username"
              label="用户名"
              name="username"
              autoComplete="username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱"
              name="email"
              type="email"
              autoComplete="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type={showPassword ? 'text' : 'password'}
              id="reg-password"
              autoComplete="new-password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              disabled={loading}
              helperText="密码长度至少6位"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="切换密码显示"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="确认密码"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="切换确认密码显示"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LoginPage;