// 导入Mongoose库
const mongoose = require('mongoose');

// 定义员工数据模型的Schema（数据结构）
const employeeSchema = new mongoose.Schema({
  // 员工姓名，必填
  name: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    trim: true, // 自动去除首尾空格
  },
  // 员工编号，必填且唯一
  employeeId: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    trim: true, // 自动去除首尾空格
  },
  // 员工邮箱，必填且唯一
  email: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    lowercase: true, // 自动转换为小写
    trim: true, // 自动去除首尾空格
  },
  // 员工电话
  phone: {
    type: String, // 数据类型为字符串
    trim: true, // 自动去除首尾空格
  },
  // 员工职位
  position: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    trim: true, // 自动去除首尾空格
  },
  // 员工薪资
  salary: {
    type: Number, // 数据类型为数字
    min: 0, // 最小值为0
  },
  // 入职日期
  hireDate: {
    type: Date, // 数据类型为日期
    required: true, // 必填字段
    default: Date.now, // 默认值为当前时间
  },
  // 所属部门ID（关联部门表）
  department: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB对象ID类型
    ref: 'Department', // 引用Department模型
    required: true, // 必填字段
  },
  // 直属上级（可以是其他员工的ID）
  supervisor: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB对象ID类型
    ref: 'Employee', // 引用Employee模型（自引用）
    default: null, // 默认值为null（暂无上级）
  },
  // 员工状态（在职、离职、休假等）
  status: {
    type: String, // 数据类型为字符串
    enum: ['在职', '离职', '休假', '试用期'], // 枚举值，只能是这些选项之一
    default: '试用期', // 默认值为试用期
  },
  // 员工地址
  address: {
    type: String, // 数据类型为字符串
    trim: true, // 自动去除首尾空格
  },
  // 逻辑删除标记，false表示正常，true表示已删除
  isDeleted: {
    type: Boolean, // 数据类型为布尔值
    default: false, // 默认值为false（未删除）
  },
  // 创建该员工记录的管理员ID
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB对象ID类型
    ref: 'Admin', // 引用Admin模型
    required: true, // 必填字段
  },
}, {
  // 自动添加创建时间和更新时间字段
  timestamps: true,
});

// 创建复合索引：员工编号和删除状态
// 这样可以确保未删除的员工编号唯一
employeeSchema.index({ employeeId: 1, isDeleted: 1 });
employeeSchema.index({ email: 1, isDeleted: 1 });
// 为部门字段创建索引，提高查询效率
employeeSchema.index({ department: 1, isDeleted: 1 });

// 导出员工模型
module.exports = mongoose.model('Employee', employeeSchema);