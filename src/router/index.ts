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
      path: '/prestation/:id(\\d+)', // Vérifie que l'ID est un nombre
      name: 'prestation',
      component: () => import('../views/ServiceView.vue'),
      props: true, // Passe automatiquement `id` comme prop au composant
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
