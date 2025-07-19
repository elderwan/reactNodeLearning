// 导入所需的模块
const express = require('express'); // Express路由
const Department = require('../models/Department'); // 部门数据模型
const Employee = require('../models/Employee'); // 员工数据模型
const authMiddleware = require('../middleware/auth'); // 认证中间件

// 创建路由实例
const router = express.Router();

// 应用认证中间件到所有部门路由
router.use(authMiddleware);

// 获取所有部门列表（包含关联的管理员和负责人信息）
router.get('/', async (req, res) => {
  try {
    // 从查询参数中获取分页信息
    const page = parseInt(req.query.page) || 1; // 当前页，默认第1页
    const limit = parseInt(req.query.limit) || 10; // 每页显示数量，默认10条
    const skip = (page - 1) * limit; // 跳过的记录数

    // 查询条件：只查找未删除的部门
    const query = { isDeleted: false };

    // 如果有搜索关键词，添加到查询条件
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 不区分大小写的正则表达式
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }

    // 执行查询并关联其他表的数据
    const departments = await Department.find(query)
      .populate('createdBy', 'username fullName email') // 关联创建者（管理员）信息
      .populate('manager', 'name employeeId email position') // 关联部门负责人（员工）信息
      .sort({ createdAt: -1 }) // 按创建时间倒序排列
      .skip(skip) // 跳过指定数量的记录
      .limit(limit); // 限制返回记录数

    // 获取总记录数（用于分页）
    const total = await Department.countDocuments(query);

    // 为每个部门获取员工数量（实时计算）
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        // 计算该部门的实际员工数量
        const employeeCount = await Employee.countDocuments({
          department: dept._id,
          isDeleted: false
        });

        // 如果数据库中的员工数量与实际不符，更新它
        if (dept.employeeCount !== employeeCount) {
          await Department.findByIdAndUpdate(dept._id, { employeeCount });
        }

        // 返回部门信息和实时员工数量
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    // 返回响应
    res.json({
      success: true,
      data: {
        departments: departmentsWithStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          pageSize: limit
        }
      }
    });

  } catch (error) {
    console.error('获取部门列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 根据ID获取单个部门信息（包含员工列表）
router.get('/:id', async (req, res) => {
  try {
    const departmentId = req.params.id;

    // 查找部门并关联相关数据
    const department = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    })
      .populate('createdBy', 'username fullName email') // 关联创建者信息
      .populate('manager', 'name employeeId email position phone'); // 关联负责人信息

    if (!department) {
      return res.status(404).json({
        success: false,
        message: '部门不存在'
      });
    }

    // 获取该部门的所有员工
    const employees = await Employee.find({
      department: departmentId,
      isDeleted: false
    })
      .populate('supervisor', 'name employeeId') // 关联员工的上级信息
      .sort({ createdAt: -1 });

    // 更新部门的员工数量
    if (department.employeeCount !== employees.length) {
      await Department.findByIdAndUpdate(departmentId, {
        employeeCount: employees.length
      });
    }

    // 返回部门信息和员工列表
    res.json({
      success: true,
      data: {
        department: {
          ...department.toObject(),
          employeeCount: employees.length
        },
        employees
      }
    });

  } catch (error) {
    console.error('获取部门信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的部门ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建新部门
router.post('/', async (req, res) => {
  try {
    const { name, code, description, location, phone, managerId } = req.body;
    const adminId = req.admin._id;

    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: '部门名称和编码为必填字段'
      });
    }

    // 检查部门名称是否已存在（只检查未删除的记录）
    const existingName = await Department.findOne({
      name,
      isDeleted: false
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: '部门名称已存在'
      });
    }

    // 检查部门编码是否已存在（只检查未删除的记录）
    const existingCode = await Department.findOne({
      code: code.toUpperCase(),
      isDeleted: false
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: '部门编码已存在'
      });
    }

    // 如果指定了负责人，验证负责人是否存在
    let manager = null;
    if (managerId) {
      manager = await Employee.findOne({
        _id: managerId,
        isDeleted: false
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: '指定的部门负责人不存在'
        });
      }
    }

    // 创建新部门
    const department = new Department({
      name,
      code: code.toUpperCase(),
      description,
      location,
      phone,
      manager: managerId || null,
      createdBy: adminId
    });

    // 保存到数据库
    await department.save();

    // 获取完整的部门信息（包含关联数据）
    const savedDepartment = await Department.findById(department._id)
      .populate('createdBy', 'username fullName email')
      .populate('manager', 'name employeeId email position');

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '部门创建成功',
      data: savedDepartment
    });

  } catch (error) {
    console.error('创建部门错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新部门信息
router.put('/:id', async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { name, code, description, location, phone, managerId } = req.body;

    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: '部门名称和编码为必填字段'
      });
    }

    // 查找要更新的部门
    const departmentToUpdate = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    });

    if (!departmentToUpdate) {
      return res.status(404).json({
        success: false,
        message: '部门不存在'
      });
    }

    // 检查部门名称是否已被其他部门使用
    const existingName = await Department.findOne({
      name,
      _id: { $ne: departmentId }, // 排除当前部门
      isDeleted: false
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: '部门名称已存在'
      });
    }

    // 检查部门编码是否已被其他部门使用
    const existingCode = await Department.findOne({
      code: code.toUpperCase(),
      _id: { $ne: departmentId }, // 排除当前部门
      isDeleted: false
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: '部门编码已存在'
      });
    }

    // 如果指定了负责人，验证负责人是否存在
    let manager = null;
    if (managerId) {
      manager = await Employee.findOne({
        _id: managerId,
        isDeleted: false
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: '指定的部门负责人不存在'
        });
      }
    }

    // 更新部门信息
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      {
        name,
        code: code.toUpperCase(),
        description,
        location,
        phone,
        manager: managerId || null,
        updatedAt: new Date()
      },
      { new: true } // 返回更新后的文档
    )
      .populate('createdBy', 'username fullName email')
      .populate('manager', 'name employeeId email position');

    // 返回更新后的部门信息
    res.json({
      success: true,
      message: '部门信息更新成功',
      data: updatedDepartment
    });

  } catch (error) {
    console.error('更新部门信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的部门ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 逻辑删除部门（软删除，并处理关联的员工）
router.delete('/:id', async (req, res) => {
  try {
    const departmentId = req.params.id;

    // 查找要删除的部门
    const departmentToDelete = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    });

    if (!departmentToDelete) {
      return res.status(404).json({
        success: false,
        message: '部门不存在'
      });
    }

    // 检查该部门下是否还有员工
    const employeeCount = await Employee.countDocuments({
      department: departmentId,
      isDeleted: false
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `该部门下还有 ${employeeCount} 名员工，无法删除。请先转移或删除部门下的员工。`
      });
    }

    // 执行逻辑删除（设置isDeleted为true）
    await Department.findByIdAndUpdate(departmentId, {
      isDeleted: true,
      updatedAt: new Date()
    });

    // 返回成功响应
    res.json({
      success: true,
      message: '部门删除成功'
    });

  } catch (error) {
    console.error('删除部门错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的部门ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取部门统计信息（多表查询示例）
router.get('/:id/stats', async (req, res) => {
  try {
    const departmentId = req.params.id;

    // 验证部门是否存在
    const department = await Department.findOne({
      _id: departmentId,
      isDeleted: false
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: '部门不存在'
      });
    }

    // 并行查询多个统计数据
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      trialEmployees,
      resignedEmployees,
      avgSalary,
      recentHires
    ] = await Promise.all([
      // 部门总员工数（包括已离职的）
      Employee.countDocuments({ department: departmentId, isDeleted: false }),
      
      // 在职员工数
      Employee.countDocuments({ 
        department: departmentId, 
        status: '在职', 
        isDeleted: false 
      }),
      
      // 休假员工数
      Employee.countDocuments({ 
        department: departmentId, 
        status: '休假', 
        isDeleted: false 
      }),
      
      // 试用期员工数
      Employee.countDocuments({ 
        department: departmentId, 
        status: '试用期', 
        isDeleted: false 
      }),
      
      // 已离职员工数
      Employee.countDocuments({ 
        department: departmentId, 
        status: '离职', 
        isDeleted: false 
      }),
      
      // 平均薪资
      Employee.aggregate([
        { 
          $match: { 
            department: departmentId, 
            isDeleted: false,
            salary: { $exists: true, $ne: null }
          } 
        },
        { 
          $group: { 
            _id: null, 
            avgSalary: { $avg: '$salary' } 
          } 
        }
      ]),
      
      // 最近30天入职的员工
      Employee.find({
        department: departmentId,
        isDeleted: false,
        hireDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).select('name employeeId hireDate position')
    ]);

    // 处理平均薪资结果
    const averageSalary = avgSalary.length > 0 ? Math.round(avgSalary[0].avgSalary) : 0;

    // 返回统计信息
    res.json({
      success: true,
      data: {
        departmentInfo: {
          id: department._id,
          name: department.name,
          code: department.code
        },
        statistics: {
          totalEmployees,
          employeesByStatus: {
            active: activeEmployees,
            onLeave: onLeaveEmployees,
            trial: trialEmployees,
            resigned: resignedEmployees
          },
          averageSalary,
          recentHires: {
            count: recentHires.length,
            employees: recentHires
          }
        },
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('获取部门统计信息错误:', error);
    
    // 处理无效的ObjectId格式
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '无效的部门ID格式'
      });
    }

    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 导出路由
module.exports = router;