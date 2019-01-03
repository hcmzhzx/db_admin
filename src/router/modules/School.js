import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/School',
   name: 'demo/School',
   meta,
   redirect: { name: 'demo-School' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/School/index'), meta: { meta, title: '学校管理' } },
      { path: 'addSchool', name: `${pre}-addSchool`, component: () => import('@/pages/demo/School/addSchool'), meta: { meta, title: '添加学校' } },
      { path: 'region', name: `${pre}-region`, component: () => import('@/pages/demo/School/region'), meta: { meta, title: '地区管理' } },
      { path: 'combo', name: `${pre}-combo`, component: () => import('@/pages/demo/School/combo'), meta: { meta, title: '套餐管理' } },
      { path: 'addCombo', name: `${pre}-addCombo`, component: () => import('@/pages/demo/School/addCombo'), meta: { meta, title: '添加套餐' } },
      { path: 'everyday', name: `${pre}-everyday`, component: () => import('@/pages/demo/School/everyday'), meta: { meta, title: '每日实拍' } },
      { path: 'addEveryday', name: `${pre}-addEveryday`, component: () => import('@/pages/demo/School/addEveryday'), meta: { meta, title: '添加每日实拍' } },
      { path: 'semester', name: `${pre}-semester`, component: () => import('@/pages/demo/School/semester'), meta: { meta, title: '学期管理' } },
      { path: 'addSemester', name: `${pre}-addSemester`, component: () => import('@/pages/demo/School/addSemester'), meta: { meta, title: '添加学期' } }
   ])('demo-School')
}
