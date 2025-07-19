import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DepartmentsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        部门管理
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          部门管理功能正在开发中...
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          功能包括：
        </Typography>
        <ul>
          <li>查看所有部门列表</li>
          <li>添加新部门</li>
          <li>编辑部门信息</li>
          <li>删除部门（逻辑删除）</li>
          <li>查看部门统计信息</li>
          <li>设置部门负责人</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default DepartmentsPage;