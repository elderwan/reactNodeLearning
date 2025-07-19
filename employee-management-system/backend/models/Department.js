// 导入Mongoose库
const mongoose = require('mongoose');

// 定义部门数据模型的Schema（数据结构）
const departmentSchema = new mongoose.Schema({
  // 部门名称，必填且唯一
  name: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    trim: true, // 自动去除首尾空格
  },
  // 部门编码，必填且唯一
  code: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    uppercase: true, // 自动转换为大写
    trim: true, // 自动去除首尾空格
  },
  // 部门描述
  description: {
    type: String, // 数据类型为字符串
    trim: true, // 自动去除首尾空格
  },
  // 部门负责人（可以是员工ID）
  manager: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB对象ID类型
    ref: 'Employee', // 引用Employee模型
    default: null, // 默认值为null（暂无负责人）
  },
  // 部门所在地址
  location: {
    type: String, // 数据类型为字符串
    trim: true, // 自动去除首尾空格
  },
  // 部门电话
  phone: {
    type: String, // 数据类型为字符串
    trim: true, // 自动去除首尾空格
  },
  // 部门员工数量（冗余字段，便于查询）
  employeeCount: {
    type: Number, // 数据类型为数字
    default: 0, // 默认值为0
    min: 0, // 最小值为0
  },
  // 逻辑删除标记，false表示正常，true表示已删除
  isDeleted: {
    type: Boolean, // 数据类型为布尔值
    default: false, // 默认值为false（未删除）
  },
  // 创建该部门的管理员ID
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB对象ID类型
    ref: 'Admin', // 引用Admin模型
    required: true, // 必填字段
  },
}, {
  // 自动添加创建时间和更新时间字段
  timestamps: true,
});

// 创建复合索引：部门名称和删除状态
// 这样可以确保未删除的部门名称唯一
departmentSchema.index({ name: 1, isDeleted: 1 });
departmentSchema.index({ code: 1, isDeleted: 1 });

// 导出部门模型
module.exports = mongoose.model('Department', departmentSchema);