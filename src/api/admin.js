import axios from '@/libs/request'
import qs from 'qs'

// 获取用户列表
const getUserList = (params) => {
  return axios.get('/admin/users?' + qs.stringify(params))
}

// 更新用户信息
const updateUserById = (data) => axios.post('/admin/update-user', data)

// 删除用户
// const deleteUserById = (id) => axios.get('/admin/delete-user?id=' + id)

// 检查用户名字
const checkUsername = (username) => axios.get('/admin/checkname?username=' + username)

// 新增用户
const addUser = (data) => axios.post('/admin/add-user', data)

// 批量删除用户功能, 传递的是要删除的数组对象
const deleteUserById = (ids) => axios.post('/admin/delete-user', { ids })

// 设置用户权限(角色，vip的设置)
const updateUserBatchById = (data) => axios.post('/admin/update-user-settings', data)

// 添加菜单
const addMenu = (data) => axios.post('/admin/add-menu', data)

// 获得菜单
const getMenu = () => axios.get('/admin/get-menu')

// 更新菜单
const updateMenu = (data) => axios.post('/admin/update-menu', data)

// 删除菜单
const deleteMenu = (data) => axios.post('/admin/delete-menu', data)

// 添加角色权限
const addRole = (data) => axios.post('/admin/add-role', data)

// 获取角色权限
const getRoles = () => axios.get('/admin/get-roles')

// 更新角色权限
const updateRole = (data) => axios.post('/admin/update-role', data)

// 删除角色权限
const deleteRole = (data) => axios.post('/admin/delete-role', data)
export {
  getUserList,
  updateUserById,
  deleteUserById,
  checkUsername,
  addUser,
  updateUserBatchById,
  addMenu,
  getMenu,
  updateMenu,
  deleteMenu,
  addRole,
  getRoles,
  updateRole,
  deleteRole
}
