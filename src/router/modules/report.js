import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/report',
   name: 'demo/report',
   meta,
   redirect: { name: 'demo-report' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/report/index'), meta: { meta, title: '用餐报表' } }
   ])('demo-report')
}
