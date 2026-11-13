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
      meta: { title: 'Главная' },
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
      meta: { title: 'Залы' },
    },
    {
      path: '/items',
      name: 'items',
      component: Items,
      meta: { title: 'Фильмы' },
    },
    {
      path: '/items/create/:id?',
      name: 'create-movie',
      component: CreateMovie,
      meta: { title: 'Добавление фильма' },
    },
  ],
})

router.afterEach((to) => {
  const title =
    to.name === 'create-movie' && to.params.id
      ? 'Редактирование фильма'
      : to.meta.title

  document.title = title ? `${title} | Cinema` : 'Cinema'
})

export default router
