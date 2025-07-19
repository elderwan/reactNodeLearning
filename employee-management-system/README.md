# 员工管理系统

这是一个基于 React.js + Node.js + MongoDB 技术栈的员工管理系统，专为学习 React.js、Node.js 和 MongoDB 而设计。项目中的每一行代码都包含详细的中文注释，帮助理解技术原理。

## 📋 项目特性

- ✅ **完整的认证系统** - JWT token 认证，密码加密存储
- ✅ **管理员系统** - 管理员注册、登录、信息管理
- ✅ **部门管理** - 部门增删改查，关联员工管理
- ✅ **员工管理** - 员工信息管理，部门关联，上下级关系
- ✅ **逻辑删除** - 所有删除操作使用软删除，保护数据
- ✅ **多表关联** - 管理员、部门、员工之间的复杂关联关系
- ✅ **统计功能** - 系统概览，数据统计和分析
- ✅ **响应式设计** - 基于 Material-UI 的现代化界面
- ✅ **中文注释** - 每行代码都有详细的中文说明

## 🛠️ 技术栈

### 后端技术
- **Node.js** - JavaScript 运行环境
- **Express.js** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模工具
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码加密库
- **CORS** - 跨域资源共享

### 前端技术
- **React.js** - 用户界面库
- **React Router** - 前端路由管理
- **Material-UI** - React UI 组件库
- **Axios** - HTTP 客户端
- **Context API** - 状态管理

## 📁 项目结构

```
employee-management-system/
├── backend/                 # 后端代码
│   ├── models/             # 数据模型
│   │   ├── Admin.js        # 管理员模型
│   │   ├── Department.js   # 部门模型
│   │   └── Employee.js     # 员工模型
│   ├── routes/             # 路由定义
│   │   ├── auth.js         # 认证路由
│   │   ├── admin.js        # 管理员路由
│   │   ├── department.js   # 部门路由
│   │   └── employee.js     # 员工路由
│   ├── middleware/         # 中间件
│   │   └── auth.js         # JWT 认证中间件
│   ├── .env               # 环境变量配置
│   ├── index.js           # 服务器入口文件
│   └── package.json       # 依赖配置
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   │   ├── LoginPage.js        # 登录页面
│   │   │   ├── DashboardPage.js    # 仪表板主页
│   │   │   ├── OverviewPage.js     # 系统概览页
│   │   │   ├── EmployeesPage.js    # 员工管理页
│   │   │   ├── DepartmentsPage.js  # 部门管理页
│   │   │   └── AdminsPage.js       # 管理员页面
│   │   ├── contexts/       # React Context
│   │   │   └── AuthContext.js      # 认证状态管理
│   │   ├── services/       # API 服务层
│   │   │   └── api.js      # API 接口定义
│   │   ├── App.js          # 应用主组件
│   │   └── index.js        # 应用入口
│   └── package.json        # 前端依赖配置
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd employee-management-system
```

### 2. 安装后端依赖
```bash
cd backend
npm install
```

### 3. 配置环境变量
编辑 `backend/.env` 文件：
```env
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=5000
```

### 4. 启动 MongoDB
确保 MongoDB 服务正在运行：
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (使用 Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB
```

### 5. 启动后端服务器
```bash
cd backend
npm run dev
```
后端服务将在 http://localhost:5000 启动

### 6. 安装前端依赖
新开一个终端窗口：
```bash
cd frontend
npm install
```

### 7. 启动前端应用
```bash
npm start
```
前端应用将在 http://localhost:3000 启动

## 📊 数据库设计

### 管理员表 (admins)
- `username` - 用户名（唯一）
- `password` - 加密密码
- `email` - 邮箱（唯一）
- `fullName` - 真实姓名
- `isDeleted` - 逻辑删除标记
- `createdAt/updatedAt` - 时间戳

### 部门表 (departments)
- `name` - 部门名称（唯一）
- `code` - 部门编码（唯一）
- `description` - 部门描述
- `manager` - 部门负责人（关联员工ID）
- `location` - 部门地址
- `phone` - 部门电话
- `employeeCount` - 员工数量（冗余字段）
- `isDeleted` - 逻辑删除标记
- `createdBy` - 创建者（关联管理员ID）
- `createdAt/updatedAt` - 时间戳

### 员工表 (employees)
- `name` - 员工姓名
- `employeeId` - 员工编号（唯一）
- `email` - 员工邮箱（唯一）
- `phone` - 电话号码
- `position` - 职位
- `salary` - 薪资
- `hireDate` - 入职日期
- `department` - 所属部门（关联部门ID）
- `supervisor` - 直属上级（关联员工ID）
- `status` - 员工状态（在职/离职/休假/试用期）
- `address` - 地址
- `isDeleted` - 逻辑删除标记
- `createdBy` - 创建者（关联管理员ID）
- `createdAt/updatedAt` - 时间戳

## 🔧 API 接口文档

### 认证接口
- `POST /api/auth/register` - 管理员注册
- `POST /api/auth/login` - 管理员登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/change-password` - 修改密码

### 部门管理
- `GET /api/departments` - 获取部门列表
- `GET /api/departments/:id` - 获取单个部门
- `POST /api/departments` - 创建部门
- `PUT /api/departments/:id` - 更新部门
- `DELETE /api/departments/:id` - 删除部门
- `GET /api/departments/:id/stats` - 获取部门统计

### 员工管理
- `GET /api/employees` - 获取员工列表
- `GET /api/employees/:id` - 获取单个员工
- `POST /api/employees` - 创建员工
- `PUT /api/employees/:id` - 更新员工
- `DELETE /api/employees/:id` - 删除员工
- `PUT /api/employees/batch/transfer` - 批量转移员工
- `GET /api/employees/stats/overview` - 获取员工统计

### 管理员管理
- `GET /api/admin` - 获取管理员列表
- `GET /api/admin/:id` - 获取单个管理员
- `PUT /api/admin/:id` - 更新管理员
- `DELETE /api/admin/:id` - 删除管理员
- `GET /api/admin/stats/overview` - 获取系统统计

## 🎯 学习要点

### React.js 相关
1. **函数组件和 Hooks** - 使用现代 React 语法
2. **Context API** - 全局状态管理（认证状态）
3. **React Router** - 前端路由管理
4. **组件生命周期** - useEffect 的使用
5. **事件处理** - 表单提交、用户交互
6. **条件渲染** - 根据状态显示不同内容
7. **列表渲染** - 动态渲染数据列表

### Node.js 相关
1. **Express 框架** - 路由、中间件概念
2. **异步编程** - async/await 的使用
3. **错误处理** - try/catch 错误捕获
4. **中间件设计** - JWT 认证中间件
5. **RESTful API** - 标准的 API 设计
6. **环境变量** - 配置管理

### MongoDB 相关
1. **文档数据库** - NoSQL 概念
2. **Mongoose ODM** - 对象文档映射
3. **Schema 设计** - 数据模型定义
4. **关联查询** - populate 的使用
5. **聚合查询** - 复杂统计查询
6. **索引优化** - 数据库性能优化
7. **逻辑删除** - 软删除实现

## 🔐 安全特性

1. **密码加密** - 使用 bcryptjs 加密存储
2. **JWT 认证** - 无状态认证机制
3. **权限控制** - 路由级别的访问控制
4. **输入验证** - 前后端数据验证
5. **SQL 注入防护** - Mongoose 自动防护
6. **CORS 配置** - 跨域安全控制

## 🚀 部署建议

### 开发环境
- 使用 nodemon 自动重启后端
- 使用 React 开发服务器的热重载
- MongoDB 本地安装

### 生产环境
- 使用 PM2 管理 Node.js 进程
- 使用 nginx 反向代理
- MongoDB Atlas 云数据库
- 环境变量安全配置

## 📝 待完善功能

由于这是一个学习项目，以下功能可以作为扩展练习：

1. **完整的 CRUD 界面** - 员工和部门的完整管理界面
2. **数据导入导出** - Excel 文件处理
3. **图表统计** - 使用 Chart.js 或 D3.js
4. **文件上传** - 员工头像上传
5. **邮件通知** - 入职离职通知
6. **角色权限** - 更细粒度的权限控制
7. **审计日志** - 操作记录和追踪
8. **数据备份** - 自动备份机制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如果在学习过程中遇到问题，欢迎交流讨论！

---

**祝您学习愉快！** 🎉