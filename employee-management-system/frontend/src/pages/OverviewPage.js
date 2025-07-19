// 导入React相关组件和hooks
import React, { useState, useEffect } from 'react';

// 导入Material-UI组件
import {
  Box,                    // 盒子布局组件
  Grid,                   // 网格布局组件
  Card,                   // 卡片组件
  CardContent,            // 卡片内容组件
  Typography,             // 文本组件
  CircularProgress,       // 圆形进度条
  Alert,                  // 警告信息组件
  Chip,                   // 标签组件
  Divider,                // 分割线组件
} from '@mui/material';

// 导入Material-UI图标
import {
  People,                 // 人员图标
  Business,               // 商务图标
  AdminPanelSettings,     // 管理员图标
  TrendingUp,             // 上升趋势图标
} from '@mui/icons-material';

// 导入API服务
import { getSystemStats, getEmployeeStats } from '../services/api';

// 统计卡片组件
const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: `${color}.light`,
            color: `${color}.main`,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// 系统概览页面组件
const OverviewPage = () => {
  // 加载状态
  const [loading, setLoading] = useState(true);
  
  // 错误状态
  const [error, setError] = useState(null);
  
  // 统计数据状态
  const [systemStats, setSystemStats] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);

  // 组件挂载时加载数据
  useEffect(() => {
    loadStatistics();
  }, []);

  // 加载统计数据的函数
  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行请求系统统计和员工统计数据
      const [systemResponse, employeeResponse] = await Promise.all([
        getSystemStats(),
        getEmployeeStats()
      ]);

      if (systemResponse.success) {
        setSystemStats(systemResponse.data);
      }

      if (employeeResponse.success) {
        setEmployeeStats(employeeResponse.data);
      }

    } catch (err) {
      console.error('加载统计数据失败:', err);
      setError(err.message || '加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 如果正在加载，显示加载指示器
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error" action={
          <Typography 
            variant="body2" 
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={loadStatistics}
          >
            重试
          </Typography>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* 页面标题 */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        系统概览
      </Typography>

      {/* 基础统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总员工数"
            value={systemStats?.totalEmployees || 0}
            icon={<People />}
            color="primary"
            subtitle="活跃员工总数"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="部门数量"
            value={systemStats?.totalDepartments || 0}
            icon={<Business />}
            color="success"
            subtitle="活跃部门总数"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="管理员数"
            value={systemStats?.totalAdmins || 0}
            icon={<AdminPanelSettings />}
            color="warning"
            subtitle="系统管理员"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="平均薪资"
            value={employeeStats?.overview?.averageSalary ? `¥${employeeStats.overview.averageSalary.toLocaleString()}` : '¥0'}
            icon={<TrendingUp />}
            color="info"
            subtitle="员工平均薪资"
          />
        </Grid>
      </Grid>

      {/* 员工状态分布 */}
      {employeeStats?.statusDistribution && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              员工状态分布
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {employeeStats.statusDistribution.map((status, index) => (
                <Grid item key={status._id || index}>
                  <Chip
                    label={`${status._id}: ${status.count}人`}
                    color={
                      status._id === '在职' ? 'success' :
                      status._id === '试用期' ? 'warning' :
                      status._id === '休假' ? 'info' : 'default'
                    }
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 部门员工分布 */}
      {employeeStats?.departmentDistribution && employeeStats.departmentDistribution.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              部门员工分布
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {employeeStats.departmentDistribution.slice(0, 6).map((dept, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {dept.departmentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      编码: {dept.departmentCode}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {dept.employeeCount} 人
                    </Typography>
                    {dept.avgSalary && (
                      <Typography variant="body2" color="text.secondary">
                        平均薪资: ¥{dept.avgSalary.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 系统信息 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            系统信息
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                数据生成时间
              </Typography>
              <Typography variant="body1">
                {systemStats?.generatedAt ? 
                  new Date(systemStats.generatedAt).toLocaleString('zh-CN') : 
                  '暂无数据'
                }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                系统版本
              </Typography>
              <Typography variant="body1">
                员工管理系统 v1.0.0
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverviewPage;