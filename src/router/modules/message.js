import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/message',
   name: 'demo/message',
   meta,
   redirect: { name: 'demo-message' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/message/index'), meta: { meta, title: '编辑首页', cache: true } },
      { path: 'help', name: `${pre}-help`, component: () => import('@/pages/demo/message/help'), meta: { meta, title: '操作指南', cache: true } },
      { path: 'helpEdit', name: `${pre}-helpEdit`, component: () => import('@/pages/demo/message/helpEdit'), meta: { meta, title: '编辑操作指南' } },
      { path: 'vestigate', name: `${pre}-vestigate`, component: () => import('@/pages/demo/message/vestigate'), meta: { meta, title: '问卷调查' } },
      { path: 'investigatelist', name: `${pre}-investigatelist`, component: () => import('@/pages/demo/message/investigatelist'), meta: { meta, title: '调查结果' } }
   ])('demo-message')
}

