import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/diningReport',
   name: 'demo/diningReport',
   meta,
   redirect: { name: 'demo-diningReport' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/diningReport/index'), meta: { meta, title: '用餐报表' } }
   ])('demo-diningReport')
}
