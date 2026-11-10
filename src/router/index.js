
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/components/Home.vue'
import Categories from '@/components/Categories.vue'
import Items from '@/components/Items.vue'
import CreateMovie from '@/components/CreateMovie.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
    },
    {
      path: '/items',
      name: 'items',
      component: Items,
    },
    {
      path: '/items/create',
      name: 'create-movie',
      component: CreateMovie,
    },
  ],
})

export default router
