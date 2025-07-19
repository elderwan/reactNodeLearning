import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmployeesPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        员工管理
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          员工管理功能正在开发中...
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          功能包括：
        </Typography>
        <ul>
          <li>查看所有员工列表</li>
          <li>添加新员工</li>
          <li>编辑员工信息</li>
          <li>删除员工（逻辑删除）</li>
          <li>按部门筛选员工</li>
          <li>搜索员工</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default EmployeesPage;