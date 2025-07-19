// 导入所需的模块
const express = require('express'); // Express路由
const Employee = require('../models/Employee'); // 员工数据模型
const Department = require('../models/Department'); // 部门数据模型
const authMiddleware = require('../middleware/auth'); // 认证中间件

// 创建路由实例
const router = express.Router();

// 应用认证中间件到所有员工路由
router.use(authMiddleware);

// 获取所有员工列表（包含关联的部门和上级信息）
router.get('/', async (req, res) => {
  try {
    // 从查询参数中获取分页信息
    const page = parseInt(req.query.page) || 1; // 当前页，默认第1页
    const limit = parseInt(req.query.limit) || 10; // 每页显示数量，默认10条
    const skip = (page - 1) * limit; // 跳过的记录数

    // 查询条件：只查找未删除的员工
    const query = { isDeleted: false };

    // 如果有搜索关键词，添加到查询条件
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 不区分大小写的正则表达式
      query.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { position: searchRegex }
      ];
    }

    // 按部门筛选
    if (req.query.department) {
      query.department = req.query.department;
    }

    // 按状态筛选
    if (req.query.status) {
      query.status = req.query.status;
    }

    // 执行查询并关联其他表的数据
    const employees = await Employee.find(query)
      .populate('department', 'name code location') // 关联部门信息
      .populate('supervisor', 'name employeeId position') // 关联上级信息
      .populate('createdBy', 'username fullName') // 关联创建者信息
      .sort({ createdAt: -1 }) // 按创建时间倒序排列
      .skip(skip) // 跳过指定数量的记录
      .limit(limit); // 限制返回记录数

    // 获取总记录数（用于分页）
    const total = await Employee.countDocuments(query);

    // 返回响应
    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          pageSize: limit
        }
      }
    });

  } catch (error) {
    console.error('获取员工列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 根据ID获取单个员工信息（包含所有关联数据）
router.get('/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;

    // 查找员工并关联相关数据
    const employee = await Employee.findOne({
      _id: employeeId,
      isDeleted: false
    })
      .populate('department', 'name code location phone') // 关联部门信息
      .populate('supervisor', 'name employeeId position email phone') // 关联上级信息
      .populate('createdBy', 'username fullName email'); // 关联创建者信息

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 查找该员工的下属（以该员工为上级的其他员工）
    const subordinates = await Employee.find({
      supervisor: employeeId,
      isDeleted: false
    })
      .populate('department', 'name code')
      .select('name employeeId position status hireDate');

    // 返回员工信息和下属列表
    res.json({
      success: true,
      data: {
        employee,
        subordinates
      }
    });

  } catch (error) {
    console.error('获取员工信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的员工ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建新员工
router.post('/', async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      phone,
      position,
      salary,
      hireDate,
      departmentId,
      supervisorId,
      status,
      address
    } = req.body;
    
    const adminId = req.admin._id;

    // 验证必填字段
    if (!name || !employeeId || !email || !position || !departmentId) {
      return res.status(400).json({
        success: false,
        message: '姓名、员工编号、邮箱、职位和部门为必填字段'
      });
    }

    // 检查员工编号是否已存在（只检查未删除的记录）
    const existingEmployeeId = await Employee.findOne({
      employeeId,
      isDeleted: false
    });

    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: '员工编号已存在'
      });
    }

    // 检查邮箱是否已存在（只检查未删除的记录）
    const existingEmail = await Employee.findOne({
      email,
      isDeleted: false
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    // 验证部门是否存在
    const department = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    });

    if (!department) {
      return res.status(400).json({
        success: false,
        message: '指定的部门不存在'
      });
    }

    // 如果指定了上级，验证上级是否存在
    let supervisor = null;
    if (supervisorId) {
      supervisor = await Employee.findOne({
        _id: supervisorId,
        isDeleted: false
      });

      if (!supervisor) {
        return res.status(400).json({
          success: false,
          message: '指定的上级不存在'
        });
      }

      // 检查上级是否在同一个部门（可选的业务逻辑）
      if (supervisor.department.toString() !== departmentId) {
        return res.status(400).json({
          success: false,
          message: '上级必须在同一个部门'
        });
      }
    }

    // 创建新员工
    const employee = new Employee({
      name,
      employeeId,
      email,
      phone,
      position,
      salary: salary || undefined,
      hireDate: hireDate || new Date(),
      department: departmentId,
      supervisor: supervisorId || null,
      status: status || '试用期',
      address,
      createdBy: adminId
    });

    // 保存到数据库
    await employee.save();

    // 更新部门的员工数量
    await Department.findByIdAndUpdate(departmentId, {
      $inc: { employeeCount: 1 } // 员工数量加1
    });

    // 获取完整的员工信息（包含关联数据）
    const savedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name code location')
      .populate('supervisor', 'name employeeId position')
      .populate('createdBy', 'username fullName');

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '员工创建成功',
      data: savedEmployee
    });

  } catch (error) {
    console.error('创建员工错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新员工信息
router.put('/:id', async (req, res) => {
  try {
    const employeeIdParam = req.params.id;
    const {
      name,
      employeeId,
      email,
      phone,
      position,
      salary,
      hireDate,
      departmentId,
      supervisorId,
      status,
      address
    } = req.body;

    // 验证必填字段
    if (!name || !employeeId || !email || !position || !departmentId) {
      return res.status(400).json({
        success: false,
        message: '姓名、员工编号、邮箱、职位和部门为必填字段'
      });
    }

    // 查找要更新的员工
    const employeeToUpdate = await Employee.findOne({
      _id: employeeIdParam,
      isDeleted: false
    });

    if (!employeeToUpdate) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 检查员工编号是否已被其他员工使用
    const existingEmployeeId = await Employee.findOne({
      employeeId,
      _id: { $ne: employeeIdParam }, // 排除当前员工
      isDeleted: false
    });

    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: '员工编号已存在'
      });
    }

    // 检查邮箱是否已被其他员工使用
    const existingEmail = await Employee.findOne({
      email,
      _id: { $ne: employeeIdParam }, // 排除当前员工
      isDeleted: false
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    // 验证部门是否存在
    const department = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    });

    if (!department) {
      return res.status(400).json({
        success: false,
        message: '指定的部门不存在'
      });
    }

    // 如果指定了上级，验证上级是否存在
    let supervisor = null;
    if (supervisorId) {
      // 防止员工设置自己为上级
      if (supervisorId === employeeIdParam) {
        return res.status(400).json({
          success: false,
          message: '员工不能设置自己为上级'
        });
      }

      supervisor = await Employee.findOne({
        _id: supervisorId,
        isDeleted: false
      });

      if (!supervisor) {
        return res.status(400).json({
          success: false,
          message: '指定的上级不存在'
        });
      }
    }

    // 处理部门变更的情况
    const oldDepartmentId = employeeToUpdate.department.toString();
    const newDepartmentId = departmentId;

    // 更新员工信息
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeIdParam,
      {
        name,
        employeeId,
        email,
        phone,
        position,
        salary: salary || undefined,
        hireDate: hireDate || employeeToUpdate.hireDate,
        department: departmentId,
        supervisor: supervisorId || null,
        status: status || employeeToUpdate.status,
        address,
        updatedAt: new Date()
      },
      { new: true } // 返回更新后的文档
    )
      .populate('department', 'name code location')
      .populate('supervisor', 'name employeeId position')
      .populate('createdBy', 'username fullName');

    // 如果员工更换了部门，更新相关部门的员工数量
    if (oldDepartmentId !== newDepartmentId) {
      await Promise.all([
        // 原部门员工数量减1
        Department.findByIdAndUpdate(oldDepartmentId, {
          $inc: { employeeCount: -1 }
        }),
        // 新部门员工数量加1
        Department.findByIdAndUpdate(newDepartmentId, {
          $inc: { employeeCount: 1 }
        })
      ]);
    }

    // 返回更新后的员工信息
    res.json({
      success: true,
      message: '员工信息更新成功',
      data: updatedEmployee
    });

  } catch (error) {
    console.error('更新员工信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的员工ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 逻辑删除员工（软删除，并处理相关业务逻辑）
router.delete('/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;

    // 查找要删除的员工
    const employeeToDelete = await Employee.findOne({
      _id: employeeId,
      isDeleted: false
    });

    if (!employeeToDelete) {
      return res.status(404).json({
        success: false,
        message: '员工不存在'
      });
    }

    // 检查该员工是否是其他员工的上级
    const subordinateCount = await Employee.countDocuments({
      supervisor: employeeId,
      isDeleted: false
    });

    if (subordinateCount > 0) {
      return res.status(400).json({
        success: false,
        message: `该员工还有 ${subordinateCount} 名下属，无法删除。请先处理下属的汇报关系。`
      });
    }

    // 检查该员工是否是某个部门的负责人
    const managedDepartment = await Department.findOne({
      manager: employeeId,
      isDeleted: false
    });

    if (managedDepartment) {
      return res.status(400).json({
        success: false,
        message: `该员工是 ${managedDepartment.name} 部门的负责人，无法删除。请先更换部门负责人。`
      });
    }

    // 执行逻辑删除（设置isDeleted为true）
    await Employee.findByIdAndUpdate(employeeId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    // 更新部门的员工数量
    await Department.findByIdAndUpdate(employeeToDelete.department, {
      $inc: { employeeCount: -1 } // 员工数量减1
    });

    // 返回成功响应
    res.json({
      success: true,
      message: '员工删除成功'
    });

  } catch (error) {
    console.error('删除员工错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的员工ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量转移员工到其他部门（多表更新示例）
router.put('/batch/transfer', async (req, res) => {
  try {
    const { employeeIds, targetDepartmentId } = req.body;

    // 验证必填字段
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的员工ID列表'
      });
    }

    if (!targetDepartmentId) {
      return res.status(400).json({
        success: false,
        message: '请提供目标部门ID'
      });
    }

    // 验证目标部门是否存在
    const targetDepartment = await Department.findOne({
      _id: targetDepartmentId,
      isDeleted: false
    });

    if (!targetDepartment) {
      return res.status(400).json({
        success: false,
        message: '目标部门不存在'
      });
    }

    // 查找要转移的员工
    const employeesToTransfer = await Employee.find({
      _id: { $in: employeeIds },
      isDeleted: false
    });

    if (employeesToTransfer.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有找到有效的员工'
      });
    }

    // 统计每个原部门会减少的员工数量
    const departmentCounts = {};
    employeesToTransfer.forEach(emp => {
      const deptId = emp.department.toString();
      departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1;
    });

    // 执行批量转移操作
    const transferResults = await Promise.all([
      // 更新员工的部门信息
      Employee.updateMany(
        { _id: { $in: employeeIds }, isDeleted: false },
        { 
          department: targetDepartmentId,
          supervisor: null, // 转移部门时清除上级关系
          updatedAt: new Date() 
        }
      ),
      
      // 更新目标部门的员工数量
      Department.findByIdAndUpdate(targetDepartmentId, {
        $inc: { employeeCount: employeesToTransfer.length }
      }),
      
      // 更新原部门的员工数量
      ...Object.keys(departmentCounts).map(deptId =>
        Department.findByIdAndUpdate(deptId, {
          $inc: { employeeCount: -departmentCounts[deptId] }
        })
      )
    ]);

    // 获取转移后的员工信息
    const transferredEmployees = await Employee.find({
      _id: { $in: employeeIds },
      isDeleted: false
    })
      .populate('department', 'name code')
      .select('name employeeId position');

    // 返回成功响应
    res.json({
      success: true,
      message: `成功转移 ${employeesToTransfer.length} 名员工到 ${targetDepartment.name} 部门`,
      data: {
        transferredCount: employeesToTransfer.length,
        targetDepartment: {
          id: targetDepartment._id,
          name: targetDepartment.name,
          code: targetDepartment.code
        },
        transferredEmployees
      }
    });

  } catch (error) {
    console.error('批量转移员工错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取员工统计信息（复杂聚合查询示例）
router.get('/stats/overview', async (req, res) => {
  try {
    // 并行执行多个聚合查询
    const [
      totalStats,
      statusStats,
      departmentStats,
      salaryStats,
      hireStats
    ] = await Promise.all([
      // 总体统计
      Employee.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            avgSalary: { $avg: '$salary' },
            maxSalary: { $max: '$salary' },
            minSalary: { $min: '$salary' }
          }
        }
      ]),

      // 按状态统计
      Employee.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // 按部门统计
      Employee.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        {
          $unwind: '$departmentInfo'
        },
        {
          $project: {
            departmentName: '$departmentInfo.name',
            departmentCode: '$departmentInfo.code',
            employeeCount: '$count',
            avgSalary: { $round: ['$avgSalary', 0] }
          }
        },
        { $sort: { employeeCount: -1 } }
      ]),

      // 薪资分布统计
      Employee.aggregate([
        { $match: { isDeleted: false, salary: { $exists: true, $ne: null } } },
        {
          $bucket: {
            groupBy: '$salary',
            boundaries: [0, 5000, 10000, 15000, 20000, 30000, 50000, Number.MAX_VALUE],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              avgSalary: { $avg: '$salary' }
            }
          }
        }
      ]),

      // 最近入职统计
      Employee.aggregate([
        {
          $match: {
            isDeleted: false,
            hireDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$hireDate' },
              month: { $month: '$hireDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // 处理统计结果
    const totalStatsResult = totalStats[0] || {
      totalEmployees: 0,
      avgSalary: 0,
      maxSalary: 0,
      minSalary: 0
    };

    // 返回统计信息
    res.json({
      success: true,
      data: {
        overview: {
          totalEmployees: totalStatsResult.totalEmployees,
          averageSalary: Math.round(totalStatsResult.avgSalary || 0),
          maxSalary: totalStatsResult.maxSalary || 0,
          minSalary: totalStatsResult.minSalary || 0
        },
        statusDistribution: statusStats,
        departmentDistribution: departmentStats,
        salaryDistribution: salaryStats,
        recentHires: hireStats,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('获取员工统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 导出路由
module.exports = router;