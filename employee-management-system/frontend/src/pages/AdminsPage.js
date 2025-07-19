import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        管理员管理
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          管理员管理功能正在开发中...
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          功能包括：
        </Typography>
        <ul>
          <li>查看所有管理员列表</li>
          <li>编辑管理员信息</li>
          <li>删除管理员（逻辑删除）</li>
          <li>修改密码</li>
          <li>查看系统统计</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default AdminsPage;