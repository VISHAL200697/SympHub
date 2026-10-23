import { client } from './auth.js';

export const adminApi = {
  getUsers: async (params = {}) => {
    const response = await client.get('/admin/users', { params });
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await client.patch(`/admin/users/${id}`, data);
    return response.data;
  },
  getAdminOverview: async () => {
    const response = await client.get('/admin/overview');
    return response.data;
  },
  getDepartments: async () => {
    const response = await client.get('/admin/departments');
    return response.data;
  },
  createDepartment: async (deptData) => {
    const response = await client.post('/admin/departments', deptData);
    return response.data;
  },
  deleteDepartment: async (id) => {
    const response = await client.delete(`/admin/departments/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await client.get('/admin/categories');
    return response.data;
  },
  createCategory: async (catData) => {
    const response = await client.post('/admin/categories', catData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await client.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

export default adminApi;
