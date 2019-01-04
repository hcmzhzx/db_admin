import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
  path: '/demo/admin',
  name: 'demo/admin',
  meta,
  redirect: { name: 'demo-admin' },
  component: layoutHeaderAside,
  children: (pre => [
    { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/admin/index'), meta: { meta, title: '管理员管理' } },
    { path: 'users', name: `${pre}-users`, component: () => import('@/pages/demo/admin/users'), meta: { meta, title: '用户组管理' } },
    { path: 'addUsers', name: `${pre}-addUsers`, component: () => import('@/pages/demo/admin/addUsers'), meta: { meta, title: '添加管理员' } },
    { path: 'limits', name: `${pre}-limits`, component: () => import('@/pages/demo/admin/limits'), meta: { meta, title: '权限管理' } },
  ])('demo-admin')
}
