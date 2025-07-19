// 导入所需的模块
const express = require('express'); // Express路由
const Admin = require('../models/Admin'); // 管理员数据模型
const authMiddleware = require('../middleware/auth'); // 认证中间件

// 创建路由实例
const router = express.Router();

// 应用认证中间件到所有管理员路由
router.use(authMiddleware);

// 获取所有管理员列表（只显示未删除的）
router.get('/', async (req, res) => {
  try {
    // 从查询参数中获取分页信息
    const page = parseInt(req.query.page) || 1; // 当前页，默认第1页
    const limit = parseInt(req.query.limit) || 10; // 每页显示数量，默认10条
    const skip = (page - 1) * limit; // 跳过的记录数

    // 查询条件：只查找未删除的管理员
    const query = { isDeleted: false };

    // 如果有搜索关键词，添加到查询条件
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 不区分大小写的正则表达式
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { fullName: searchRegex }
      ];
    }

    // 执行查询（不包含密码字段）
    const admins = await Admin.find(query)
      .select('-password') // 排除密码字段
      .sort({ createdAt: -1 }) // 按创建时间倒序排列
      .skip(skip) // 跳过指定数量的记录
      .limit(limit); // 限制返回记录数

    // 获取总记录数（用于分页）
    const total = await Admin.countDocuments(query);

    // 返回响应
    res.json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          pageSize: limit
        }
      }
    });

  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 根据ID获取单个管理员信息
router.get('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;

    // 查找管理员（不包含密码，只查找未删除的）
    const admin = await Admin.findOne({
      _id: adminId,
      isDeleted: false
    }).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 返回管理员信息
    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('获取管理员信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的管理员ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新管理员信息（不包括密码）
router.put('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, email, fullName } = req.body;
    const currentAdminId = req.admin._id.toString();

    // 验证必填字段
    if (!username || !email || !fullName) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 查找要更新的管理员
    const adminToUpdate = await Admin.findOne({
      _id: adminId,
      isDeleted: false
    });

    if (!adminToUpdate) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 检查用户名是否已被其他管理员使用
    const existingUsername = await Admin.findOne({
      username,
      _id: { $ne: adminId }, // 排除当前管理员
      isDeleted: false
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱是否已被其他管理员使用
    const existingEmail = await Admin.findOne({
      email,
      _id: { $ne: adminId }, // 排除当前管理员
      isDeleted: false
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    // 更新管理员信息
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        username,
        email,
        fullName,
        updatedAt: new Date()
      },
      { 
        new: true, // 返回更新后的文档
        select: '-password' // 排除密码字段
      }
    );

    // 返回更新后的管理员信息
    res.json({
      success: true,
      message: '管理员信息更新成功',
      data: updatedAdmin
    });

  } catch (error) {
    console.error('更新管理员信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的管理员ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 逻辑删除管理员（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const currentAdminId = req.admin._id.toString();

    // 不允许管理员删除自己
    if (adminId === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }

    // 查找要删除的管理员
    const adminToDelete = await Admin.findOne({
      _id: adminId,
      isDeleted: false
    });

    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 执行逻辑删除（设置isDeleted为true）
    await Admin.findByIdAndUpdate(adminId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    // 返回成功响应
    res.json({
      success: true,
      message: '管理员删除成功'
    });

  } catch (error) {
    console.error('删除管理员错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的管理员ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取系统统计信息
router.get('/stats/overview', async (req, res) => {
  try {
    // 并行查询多个统计数据
    const [adminCount, departmentCount, employeeCount] = await Promise.all([
      Admin.countDocuments({ isDeleted: false }), // 活跃管理员数量
      require('../models/Department').countDocuments({ isDeleted: false }), // 活跃部门数量
      require('../models/Employee').countDocuments({ isDeleted: false }) // 活跃员工数量
    ]);

    // 返回统计信息
    res.json({
      success: true,
      data: {
        totalAdmins: adminCount,
        totalDepartments: departmentCount,
        totalEmployees: employeeCount,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 导出路由
module.exports = router;