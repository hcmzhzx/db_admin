import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/orders',
   name: 'demo/orders',
   meta,
   redirect: { name: 'demo-orders' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/orders/index'), meta: { meta, title: '订单列表', cache: true } },
      { path: 'balance', name: `${pre}-balance`, component: () => import('@/pages/demo/orders/balance'), meta: { meta, title: '余额管理', cache: true } }
   ])('demo-orders')
}
