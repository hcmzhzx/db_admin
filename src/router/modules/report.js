import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/report',
   name: 'demo/report',
   meta,
   redirect: { name: 'demo-report' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/report/index'), meta: { meta, title: '用餐报表', cache: true } },
      { path: 'pride', name: `${pre}-pride`, component: () => import('@/pages/demo/report/pride'), meta: { meta, title: '支付名单', cache: true } },
      { path: 'catering', name: `${pre}-catering`, component: () => import('@/pages/demo/report/catering'), meta: { meta, title: '配餐收入', cache: true } },
      { path: 'reckoning', name: `${pre}-reckoning`, component: () => import('@/pages/demo/report/reckoning'), meta: { meta, title: '农行交易账单', cache: true } }
   ])('demo-report')
}
