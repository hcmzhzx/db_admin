import { httpGet } from '@api/http'

// 菜单 侧边栏
// export default [
let menu = [
   {path: '/index', title: '首页', icon: 'home'},
   {
      title: '系统管理员',
      icon: 'folder-o',
      path: '/demo/admin',
      children: [
         {path: '/demo/admin/index', title: '管理员管理',},
         {path: '/demo/admin/users', title: '用户组管理'},
         {path: '/demo/admin/limits', title: '权限管理'}
      ]
   },
   {
      title: '学校管理系统',
      icon: 'folder-o',
      path: '/demo/School',
      children: [
         {path: '/demo/School/index', title: '学校管理'},
         {path: '/demo/School/region', title: '地区管理'},
         {path: '/demo/School/combo', title: '套餐管理'},
         {path: '/demo/School/semester', title: '学期管理'}
      ]
   },
   {
      title: '用户管理',
      icon: 'folder-o',
      path: '/demo/users',
      children: [
         {path: '/demo/users/index', title: '用户列表'},
         {path: '/demo/users/pupil', title: '学生管理'},
         {path: '/demo/users/leave', title: '请假列表'}
      ]
   },
   {
      title: '订单管理',
      icon: 'folder-o',
      path: '/demo/orders',
      children: [
         {path: '/demo/orders/index', title: '订单列表'},
         {path: '/demo/orders/balance', title: '余额管理'}
      ]
   },
   {
      title: '数据报表',
      icon: 'folder-o',
      path: '/demo/diningReport',
      children: [
         {path: '/demo/diningReport/index', title: '用餐报表'}
      ]
   },
   {
      title: '信息管理',
      icon: 'folder-o',
      path: '/demo/message',
      children: [
         {path: '/demo/message/index', title: '编辑首页'},
         {path: '/demo/message/help', title: '操作指南'},
         {path: '/demo/message/vestigate', title: '问卷调查'}
      ]
   }
]

/*httpGet('district').then(res => {
   console.log(res);
})*/

export default menu

