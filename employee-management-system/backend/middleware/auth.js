// 导入JWT库和管理员模型
const jwt = require('jsonwebtoken'); // JWT token处理库
const Admin = require('../models/Admin'); // 管理员数据模型

// JWT认证中间件函数
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头中获取Authorization字段
    const authHeader = req.header('Authorization');
    
    // 检查是否提供了认证头
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: '访问被拒绝，请提供认证token' 
      });
    }

    // 检查认证头格式是否正确（应该是 "Bearer token"）
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '认证token格式错误' 
      });
    }

    // 提取token（去掉"Bearer "前缀）
    const token = authHeader.substring(7);

    // 验证token的有效性
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 根据token中的管理员ID查找管理员信息
    const admin = await Admin.findById(decoded.adminId).select('-password'); // 排除密码字段
    
    // 检查管理员是否存在且未被删除
    if (!admin || admin.isDeleted) {
      return res.status(401).json({ 
        success: false, 
        message: '无效的认证token或管理员账户不存在' 
      });
    }

    // 将管理员信息添加到请求对象中，供后续路由使用
    req.admin = admin;
    
    // 继续执行下一个中间件或路由处理函数
    next();
    
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    // 处理JWT相关的错误
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: '无效的认证token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: '认证token已过期' 
      });
    }
    
    // 其他服务器错误
    return res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
};

// 导出认证中间件
module.exports = authMiddleware;