// 导入所需的模块
const express = require('express'); // Express框架，用于创建HTTP服务器
const mongoose = require('mongoose'); // MongoDB数据库连接库
const cors = require('cors'); // 跨域资源共享中间件
const dotenv = require('dotenv'); // 环境变量配置

// 导入路由模块
const authRoutes = require('./routes/auth'); // 认证相关路由
const adminRoutes = require('./routes/admin'); // 管理员相关路由
const departmentRoutes = require('./routes/department'); // 部门相关路由
const employeeRoutes = require('./routes/employee'); // 员工相关路由

// 加载环境变量配置
dotenv.config();

// 创建Express应用实例
const app = express();

// 配置中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON格式的请求体

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, // 使用新的URL解析器
  useUnifiedTopology: true, // 使用新的统一拓扑引擎
})
.then(() => {
  console.log('MongoDB数据库连接成功');
})
.catch((err) => {
  console.error('MongoDB数据库连接失败:', err);
});

// 配置API路由
app.use('/api/auth', authRoutes); // 认证相关API路由
app.use('/api/admin', adminRoutes); // 管理员相关API路由
app.use('/api/departments', departmentRoutes); // 部门相关API路由
app.use('/api/employees', employeeRoutes); // 员工相关API路由

// 根路径处理
app.get('/', (req, res) => {
  res.json({ message: '员工管理系统API服务器运行中' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});