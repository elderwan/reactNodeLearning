// 导入所需的模块
const express = require('express'); // Express路由
const bcrypt = require('bcryptjs'); // 密码加密库
const jwt = require('jsonwebtoken'); // JWT token生成库
const Admin = require('../models/Admin'); // 管理员数据模型
const authMiddleware = require('../middleware/auth'); // 认证中间件

// 创建路由实例
const router = express.Router();

// 管理员注册路由
router.post('/register', async (req, res) => {
  try {
    // 从请求体中提取注册信息
    const { username, password, email, fullName } = req.body;

    // 验证必填字段
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位'
      });
    }

    // 检查用户名是否已存在（只检查未删除的记录）
    const existingUsername = await Admin.findOne({ 
      username, 
      isDeleted: false 
    });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在（只检查未删除的记录）
    const existingEmail = await Admin.findOne({ 
      email, 
      isDeleted: false 
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    // 加密密码
    const saltRounds = 10; // 盐值轮数，越高越安全但越慢
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建新管理员
    const admin = new Admin({
      username,
      password: hashedPassword, // 保存加密后的密码
      email,
      fullName
    });

    // 保存到数据库
    await admin.save();

    // 返回成功响应（不包含密码）
    res.status(201).json({
      success: true,
      message: '管理员注册成功',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 管理员登录路由
router.post('/login', async (req, res) => {
  try {
    // 从请求体中提取登录信息
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    // 查找管理员（只查找未删除的记录）
    const admin = await Admin.findOne({ 
      username, 
      isDeleted: false 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { adminId: admin._id }, // 载荷（payload）
      process.env.JWT_SECRET, // 密钥
      { expiresIn: '24h' } // 过期时间为24小时
    );

    // 返回成功响应，包含token和管理员信息
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          fullName: admin.fullName
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取当前登录管理员信息路由（需要认证）
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // 从认证中间件中获取管理员信息
    const admin = req.admin;

    // 返回管理员信息（不包含密码）
    res.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更改密码路由（需要认证）
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    // 从请求体中提取密码信息
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin._id;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请输入当前密码和新密码'
      });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少为6位'
      });
    }

    // 查找管理员并包含密码字段
    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 加密新密码
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await Admin.findByIdAndUpdate(adminId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    // 返回成功响应
    res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 导出路由
module.exports = router;