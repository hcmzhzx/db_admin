import layoutHeaderAside from '@/layout/header-aside'

const meta = { requiresAuth: true }

export default {
   path: '/demo/school',
   name: 'demo/school',
   meta,
   redirect: { name: 'demo-school' },
   component: layoutHeaderAside,
   children: (pre => [
      { path: 'index', name: `${pre}`, component: () => import('@/pages/demo/school/index'), meta: { meta, title: '学校管理' } },
      { path: 'addSchool', name: `${pre}-addSchool`, component: () => import('@/pages/demo/school/addSchool'), meta: { meta, title: '添加学校' } },
      { path: 'region', name: `${pre}-region`, component: () => import('@/pages/demo/school/region'), meta: { meta, title: '地区管理' } },
      { path: 'combo', name: `${pre}-combo`, component: () => import('@/pages/demo/school/combo'), meta: { meta, title: '套餐管理' } },
      { path: 'addCombo', name: `${pre}-addCombo`, component: () => import('@/pages/demo/school/addCombo'), meta: { meta, title: '添加套餐' } },
      { path: 'everyday', name: `${pre}-everyday`, component: () => import('@/pages/demo/school/everyday'), meta: { meta, title: '每日实拍' } },
      { path: 'addEveryday', name: `${pre}-addEveryday`, component: () => import('@/pages/demo/school/addEveryday'), meta: { meta, title: '添加每日实拍' } },
      { path: 'semester', name: `${pre}-semester`, component: () => import('@/pages/demo/school/semester'), meta: { meta, title: '学期管理' } },
      { path: 'addSemester', name: `${pre}-addSemester`, component: () => import('@/pages/demo/school/addSemester'), meta: { meta, title: '添加学期' } }
   ])('demo-school')
}
