import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/prestation',
      name: 'prestation',
      component: () => import('../views/ServiceView.vue'),
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/reservation/:service',
      name: 'reservation',
      component: () => import('../views/ReservationView.vue')
    }
  ]
})

export default router
