import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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
      path: '/prestation/:id(\\d+)',
      name: 'prestation',
      component: () => import('../views/ServiceView.vue'),
      props: true,
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reservation/:service',
      name: 'reservation',
      component: () => import('../views/ReservationView.vue'),
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: () => import('../views/SignupView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/mes-rendez-vous',
      name: 'rendez-vous',
      component: () => import('../views/AppointmentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/photos',
      name: 'photos',
      component: () => import('../views/PhotosView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/mentions-legales',
      name: 'mentions-legales',
      component: () => import('../views/MentionsLegalesView.vue'),
    },
    {
      path: '/politique-de-confidentialite',
      name: 'politique-confidentialite',
      component: () => import('../views/PolitiqueConfidentialiteView.vue'),
    },
    {
      path: '/admin',
      component: () => import('../layout/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, isAdminShell: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'calendrier',
          name: 'admin-calendrier',
          component: () => import('../views/admin/AdminCalendarView.vue'),
        },
        {
          path: 'horaires',
          name: 'admin-horaires',
          component: () => import('../views/admin/AdminScheduleView.vue'),
        },
        {
          path: 'prestations',
          name: 'admin-prestations',
          component: () => import('../views/admin/AdminServicesView.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('../views/admin/AdminCategoriesView.vue'),
        },
        {
          path: 'images',
          name: 'admin-images',
          component: () => import('../views/admin/AdminImagesView.vue'),
        },
        {
          path: 'clients',
          name: 'admin-clients',
          component: () => import('../views/admin/AdminClientsView.vue'),
        },
        {
          path: 'statistiques',
          name: 'admin-statistiques',
          component: () => import('../views/admin/AdminStatisticsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.hydrateFromStorage()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'connexion', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  return true
})

export default router
