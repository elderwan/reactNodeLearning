// 导入axios库用于HTTP请求
import axios from 'axios';

// 设置API基础URL - 指向后端服务器地址
const API_BASE_URL = 'http://localhost:5000/api';

// 创建axios实例，用于统一配置请求参数
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // 设置默认请求头为JSON格式
  },
});

// 请求拦截器 - 在每个请求发送前自动添加认证token
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取保存的token
    const token = localStorage.getItem('token');
    if (token) {
      // 如果token存在，添加到请求头的Authorization字段
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求发送失败时的处理
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    // 请求成功时直接返回响应数据
    return response;
  },
  (error) => {
    // 请求失败时的错误处理
    if (error.response?.status === 401) {
      // 如果返回401未授权，说明token无效或过期
      // 清除本地token并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ 认证相关API ============

// 管理员登录接口
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '登录失败' };
  }
};

// 管理员注册接口
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '注册失败' };
  }
};

// 获取当前登录管理员信息
export const getCurrentAdmin = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取用户信息失败' };
  }
};

// 修改密码接口
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '修改密码失败' };
  }
};

// ============ 部门管理API ============

// 获取所有部门列表
export const getDepartments = async (params = {}) => {
  try {
    const response = await apiClient.get('/departments', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取部门列表失败' };
  }
};

// 根据ID获取单个部门信息
export const getDepartmentById = async (id) => {
  try {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取部门信息失败' };
  }
};

// 创建新部门
export const createDepartment = async (departmentData) => {
  try {
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '创建部门失败' };
  }
};

// 更新部门信息
export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await apiClient.put(`/departments/${id}`, departmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '更新部门失败' };
  }
};

// 删除部门
export const deleteDepartment = async (id) => {
  try {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '删除部门失败' };
  }
};

// 获取部门统计信息
export const getDepartmentStats = async (id) => {
  try {
    const response = await apiClient.get(`/departments/${id}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取部门统计信息失败' };
  }
};

// ============ 员工管理API ============

// 获取所有员工列表
export const getEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取员工列表失败' };
  }
};

// 根据ID获取单个员工信息
export const getEmployeeById = async (id) => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取员工信息失败' };
  }
};

// 创建新员工
export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '创建员工失败' };
  }
};

// 更新员工信息
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '更新员工失败' };
  }
};

// 删除员工
export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '删除员工失败' };
  }
};

// 批量转移员工到其他部门
export const transferEmployees = async (transferData) => {
  try {
    const response = await apiClient.put('/employees/batch/transfer', transferData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '批量转移员工失败' };
  }
};

// 获取员工统计信息
export const getEmployeeStats = async () => {
  try {
    const response = await apiClient.get('/employees/stats/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取员工统计信息失败' };
  }
};

// ============ 管理员管理API ============

// 获取所有管理员列表
export const getAdmins = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取管理员列表失败' };
  }
};

// 根据ID获取单个管理员信息
export const getAdminById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取管理员信息失败' };
  }
};

// 更新管理员信息
export const updateAdmin = async (id, adminData) => {
  try {
    const response = await apiClient.put(`/admin/${id}`, adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '更新管理员失败' };
  }
};

// 删除管理员
export const deleteAdmin = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '删除管理员失败' };
  }
};

// 获取系统统计信息
export const getSystemStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取系统统计信息失败' };
  }
};

// 导出API客户端实例，供其他地方使用
export default apiClient;