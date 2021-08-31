import { createRouter, createWebHistory } from 'vue-router'
import RouterTransition from '@/layouts/content.vue'

const routes = [
  {
    path: '/',
    redirect: '/d3',
    component: RouterTransition,
    children: [
      {
        path: '/d3',
        name: 'd3',
        redirect: '/d3/flower',
        component: RouterTransition,
        children: [
          {
            path: 'flower',
            name: 'Flower',
            meta: { title: 'flower' },
            component: () => import('@/views/d3/flower/index.vue')
          },
          {
            path: 'flowline',
            name: 'Flowline',
            meta: { title: 'Flowline' },
            component: () => import('@/views/d3/flowline/index.vue')
          },
          {
            path: 'mapfly',
            name: 'MapFly',
            meta: { title: 'MapFly' },
            component: () => import('@/views/d3/mapFly/index.vue')
          },
          {
            path: 'vincent',
            name: 'Vincent',
            meta: { title: 'Vincent' },
            component: () => import('@/views/d3/vincent/index.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
