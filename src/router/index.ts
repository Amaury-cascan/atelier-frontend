import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ el: to.hash, behavior: 'smooth', top: 80 }), 120);
      });
    }
    return { top: 0, behavior: 'smooth' };
  },
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
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/mes-rendez-vous',
      name: 'rendez-vous',
      component: () => import('../views/AppointmentView.vue')
    },
    {
      path: '/photos',
      name: 'photos',
      component: () => import('../views/PhotosView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/mentions-legales',
      name: 'mentions-legales',
      component: () => import('../views/MentionsLegalesView.vue')
    },
    {
      path: '/politique-de-confidentialite',
      name: 'politique-confidentialite',
      component: () => import('../views/PolitiqueConfidentialiteView.vue')
    }
  ]
})


export default router
