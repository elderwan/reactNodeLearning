// 导入Mongoose库
const mongoose = require('mongoose');

// 定义管理员数据模型的Schema（数据结构）
const adminSchema = new mongoose.Schema({
  // 管理员用户名，必填且唯一
  username: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    trim: true, // 自动去除首尾空格
  },
  // 管理员密码，必填
  password: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    minlength: 6, // 最小长度为6位
  },
  // 管理员邮箱，必填且唯一
  email: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    unique: true, // 唯一索引，不允许重复
    lowercase: true, // 自动转换为小写
    trim: true, // 自动去除首尾空格
  },
  // 管理员真实姓名
  fullName: {
    type: String, // 数据类型为字符串
    required: true, // 必填字段
    trim: true, // 自动去除首尾空格
  },
  // 逻辑删除标记，false表示正常，true表示已删除
  isDeleted: {
    type: Boolean, // 数据类型为布尔值
    default: false, // 默认值为false（未删除）
  },
}, {
  // 自动添加创建时间和更新时间字段
  timestamps: true,
});

// 创建复合索引：用户名和删除状态
// 这样可以确保未删除的管理员用户名唯一
adminSchema.index({ username: 1, isDeleted: 1 });

// 导出管理员模型
module.exports = mongoose.model('Admin', adminSchema);