// 导入React相关组件和hooks
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// 导入Material-UI组件
import {
  Box,                    // 盒子布局组件
  Drawer,                 // 抽屉侧边栏组件
  AppBar,                 // 顶部应用栏组件
  Toolbar,                // 工具栏组件
  List,                   // 列表组件
  Typography,             // 文本组件
  Divider,                // 分割线组件
  IconButton,             // 图标按钮
  ListItem,               // 列表项组件
  ListItemButton,         // 列表项按钮
  ListItemIcon,           // 列表项图标
  ListItemText,           // 列表项文本
  Avatar,                 // 头像组件
  Menu,                   // 菜单组件
  MenuItem,               // 菜单项组件
  useMediaQuery,          // 媒体查询hook
  useTheme,               // 主题hook
} from '@mui/material';

// 导入Material-UI图标
import {
  Menu as MenuIcon,       // 菜单图标
  Dashboard,              // 仪表板图标
  People,                 // 人员图标
  Business,               // 商务/部门图标
  AdminPanelSettings,     // 管理员图标
  ExitToApp,              // 退出图标
  AccountCircle,          // 账户图标
  Settings,               // 设置图标
} from '@mui/icons-material';

// 导入认证上下文
import { useAuth } from '../contexts/AuthContext';

// 导入页面组件（稍后创建）
import OverviewPage from './OverviewPage';
import EmployeesPage from './EmployeesPage';
import DepartmentsPage from './DepartmentsPage';
import AdminsPage from './AdminsPage';

// 侧边栏宽度常量
const DRAWER_WIDTH = 240;

// 导航菜单配置
const navigationItems = [
  {
    text: '概览',
    icon: <Dashboard />,
    path: '/dashboard',
    description: '系统概览和统计信息'
  },
  {
    text: '员工管理',
    icon: <People />,
    path: '/dashboard/employees',
    description: '员工信息的增删改查'
  },
  {
    text: '部门管理',
    icon: <Business />,
    path: '/dashboard/departments',
    description: '部门信息的增删改查'
  },
  {
    text: '管理员',
    icon: <AdminPanelSettings />,
    path: '/dashboard/admins',
    description: '系统管理员管理'
  },
];

// 仪表板主页面组件
const DashboardPage = () => {
  // 获取路由相关hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取主题和媒体查询
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 获取认证上下文
  const { admin, logout } = useAuth();

  // 侧边栏状态（移动端可收起）
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // 用户菜单状态
  const [anchorEl, setAnchorEl] = useState(null);

  // 处理抽屉开关
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 处理用户菜单打开
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 处理用户菜单关闭
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // 处理登出
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  // 处理导航点击
  const handleNavigationClick = (path) => {
    navigate(path);
    // 移动端点击后自动关闭侧边栏
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // 侧边栏内容组件
  const DrawerContent = () => (
    <Box sx={{ overflow: 'auto' }}>
      {/* 侧边栏头部 */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" noWrap component="div" color="primary">
          员工管理系统
        </Typography>
        <Typography variant="body2" color="text.secondary">
          管理员控制台
        </Typography>
      </Box>
      
      <Divider />
      
      {/* 导航列表 */}
      <List>
        {navigationItems.map((item) => {
          // 判断当前路径是否激活
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigationClick(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={!isActive ? item.description : null}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 顶部应用栏 */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {/* 移动端菜单按钮 */}
          <IconButton
            color="inherit"
            aria-label="打开导航菜单"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* 页面标题 */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || '概览'}
          </Typography>
          
          {/* 用户信息和菜单 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              欢迎，{admin?.fullName || admin?.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="用户账户"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {admin?.fullName?.[0] || admin?.username?.[0] || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 用户菜单 */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          个人资料
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          设置
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          退出登录
        </MenuItem>
      </Menu>

      {/* 侧边栏抽屉 */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="导航菜单"
      >
        {/* 移动端临时抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 提高移动端性能
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            },
          }}
        >
          <DrawerContent />
        </Drawer>
        
        {/* 桌面端永久抽屉 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            },
          }}
          open
        >
          <DrawerContent />
        </Drawer>
      </Box>

      {/* 主内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // 为AppBar留出空间
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* 路由内容 */}
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          {/* 404路由 */}
          <Route path="*" element={
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h4" gutterBottom>
                页面未找到
              </Typography>
              <Typography variant="body1" color="text.secondary">
                抱歉，您访问的页面不存在。
              </Typography>
            </Box>
          } />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardPage;