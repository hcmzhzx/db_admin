import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/users',
   name: 'demo/users',
   meta,
   redirect: { name: 'demo-users' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/users/index'), meta: { meta, title: '用户列表', cache: true } },
      { path: 'pupil', name: `${pre}-pupil`, component: () => import('@/pages/demo/users/pupil'), meta: { meta, title: '学生管理', cache: true } },
      { path: 'leave', name: `${pre}-leave`, component: () => import('@/pages/demo/users/leave'), meta: { meta, title: '请假列表', cache: true } }
   ])('demo-users')
}
