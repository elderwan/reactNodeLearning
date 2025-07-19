# 🚀 项目启动指南

## 快速启动步骤

### 1. 确保 MongoDB 正在运行

#### 检查 MongoDB 是否已安装
```bash
mongod --version
```

#### 启动 MongoDB 服务
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod  # 开机自启

# macOS (如果使用 Homebrew 安装)
brew services start mongodb-community

# Windows
net start MongoDB
```

#### 验证 MongoDB 连接
```bash
# 连接到 MongoDB shell
mongo
# 或者 (MongoDB 6.0+)
mongosh

# 在 mongo shell 中测试
> show dbs
> exit
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 启动开发服务器
npm run dev
```

**成功标志：**
```
服务器运行在端口 5000
MongoDB数据库连接成功
```

### 3. 启动前端应用

```bash
# 新开一个终端窗口
# 进入前端目录
cd frontend

# 启动 React 开发服务器
npm start
```

**成功标志：**
- 浏览器自动打开 http://localhost:3000
- 显示员工管理系统登录界面

## 🎯 首次使用指南

### 1. 注册管理员账户
- 访问 http://localhost:3000
- 点击"注册"标签页
- 填写管理员信息：
  - 姓名：例如 "系统管理员"
  - 用户名：例如 "admin"
  - 邮箱：例如 "admin@example.com"
  - 密码：至少6位字符
- 点击"注册"按钮

### 2. 登录系统
- 注册成功后会自动切换到登录页面
- 使用刚才创建的用户名和密码登录
- 登录成功后会跳转到系统仪表板

### 3. 探索功能
- **系统概览** - 查看统计信息（初始时可能显示空数据）
- **员工管理** - 管理员工信息（开发中）
- **部门管理** - 管理部门信息（开发中）
- **管理员** - 管理系统管理员（开发中）

## 🔧 常见问题解决

### MongoDB 连接问题

**问题：** `MongoDB数据库连接失败`

**解决方案：**
1. 检查 MongoDB 服务是否启动
2. 检查 `backend/.env` 文件中的数据库连接地址
3. 确保数据库端口 27017 没有被占用

### 端口冲突问题

**问题：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案：**
1. 检查其他程序是否占用了端口
2. 修改前端端口：在 frontend 目录下创建 `.env` 文件，添加 `PORT=3001`
3. 或者停止占用端口的程序

### 依赖安装问题

**问题：** npm install 失败

**解决方案：**
1. 删除 node_modules 目录和 package-lock.json
2. 重新运行 `npm install`
3. 如果仍然失败，尝试使用 `npm install --legacy-peer-deps`

## 📊 数据测试

### 创建测试数据

你可以通过 API 或者直接在 MongoDB 中插入测试数据：

#### 方法1：使用 MongoDB Shell
```javascript
// 连接到数据库
use employee_management

// 插入测试部门
db.departments.insertOne({
  name: "技术部",
  code: "TECH",
  description: "负责技术开发",
  location: "北京市海淀区",
  phone: "010-12345678",
  employeeCount: 0,
  isDeleted: false,
  createdBy: ObjectId("你的管理员ID"),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### 方法2：使用 API 工具（如 Postman）
```bash
# 创建部门
POST http://localhost:5000/api/departments
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "name": "技术部",
  "code": "TECH",
  "description": "负责技术开发",
  "location": "北京市海淀区",
  "phone": "010-12345678"
}
```

## 🛠️ 开发环境配置

### VS Code 推荐扩展
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API 测试)

### 浏览器开发工具
- React Developer Tools
- Redux DevTools (如果使用 Redux)

## 📝 下一步学习建议

1. **完善员工管理页面** - 实现完整的 CRUD 操作
2. **完善部门管理页面** - 添加部门的增删改查功能
3. **添加数据表格** - 使用 Material-UI 的 DataGrid 组件
4. **实现搜索和筛选** - 让用户能够快速找到数据
5. **添加表单验证** - 提升用户体验
6. **实现文件上传** - 员工头像上传功能
7. **添加统计图表** - 使用 Chart.js 或 Recharts

## 🎉 项目学习收获

通过这个项目，你将学会：

- ✅ React 函数组件和 Hooks 的使用
- ✅ React Router 路由管理
- ✅ Material-UI 组件库的使用
- ✅ Node.js 和 Express 后端开发
- ✅ MongoDB 数据库设计和操作
- ✅ JWT 认证机制的实现
- ✅ 前后端数据交互
- ✅ RESTful API 设计
- ✅ 错误处理和用户体验优化

---

**开始你的学习之旅吧！** 🎯