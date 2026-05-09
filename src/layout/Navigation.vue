<template>
  <nav class="navbar">
    <!-- Marque -->
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <img src="../assets/logo/1.png" alt="L'Atelier de Marie" class="brand-logo">
        <span class="brand-name">L'Atelier de Marie</span>
      </router-link>
    </div>

    <!-- Liens desktop -->
    <div class="nav-links">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        class="nav-item"
        @click="handleItemClick($event, item)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- Actions droite -->
    <div class="nav-actions">
      <!-- CTA desktop uniquement -->
      <button class="nav-cta nav-cta--desktop" @click="goToBooking">
        <i class="pi pi-calendar"></i>
        Prendre RDV
      </button>

      <!-- Burger mobile uniquement -->
      <button class="nav-burger" @click="toggleMobileMenu" aria-label="Menu">
        <span class="burger-line" :class="{ open: mobileMenuOpen }"></span>
        <span class="burger-line" :class="{ open: mobileMenuOpen }"></span>
        <span class="burger-line" :class="{ open: mobileMenuOpen }"></span>
      </button>
    </div>
  </nav>

  <!-- Menu mobile déroulant -->
  <Transition name="menu-drop">
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <div
        v-for="(item, index) in mobileMenuItems"
        :key="index"
        class="mobile-menu-item"
        @click="handleMobileItem(item)"
      >
        <i :class="item.icon" class="mobile-menu-icon"></i>
        {{ item.label }}
      </div>
      <div class="mobile-menu-item mobile-menu-item--cta" @click="goToBookingMobile">
        <i class="pi pi-calendar mobile-menu-icon"></i>
        Prendre rendez-vous
      </div>
    </div>
  </Transition>

  <!-- Overlay -->
  <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed, ref, watch } from "vue";

const router = useRouter();
const route  = useRoute();

const isAuthenticated = computed(() => !!localStorage.getItem('token'));
const mobileMenuOpen  = ref(false);

// Menu desktop
const getMenuItems = () => {
  const items: { label: string }[] = [
    { label: 'Institut' },
    { label: 'Galerie' },
  ];
  if (isAuthenticated.value) {
    items.push({ label: 'Mes rendez-vous' });
    items.push({ label: 'Déconnexion' });
  } else {
    items.push({ label: 'Connexion' });
  }
  return items;
};
const menuItems = ref(getMenuItems());
watch(isAuthenticated, () => { menuItems.value = getMenuItems(); });

// Menu mobile (avec icônes)
const mobileMenuItems = computed(() => {
  const items: { label: string; icon: string; route?: string }[] = [
    { label: 'Institut',  icon: 'pi pi-home',     route: '/'      },
    { label: 'Galerie',    icon: 'pi pi-images',   route: '/photos' },
  ];
  if (isAuthenticated.value) {
    items.push({ label: 'Mes rendez-vous', icon: 'pi pi-calendar-clock', route: '/mes-rendez-vous' });
    items.push({ label: 'Déconnexion',     icon: 'pi pi-sign-out' });
  } else {
    items.push({ label: 'Connexion', icon: 'pi pi-sign-in', route: '/connexion' });
  }
  return items;
});

const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value; };

const navigate = (label: string) => {
  if (label === 'déconnexion') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  }
};

const handleItemClick = (_event: MouseEvent, item: { label: string }) => {
  navigate(item.label.toLowerCase());
  const label = item.label.toLowerCase();
  if (label === 'institut') router.push('/');
  else if (label === 'galerie') router.push('/photos');
  else if (label === 'mes rendez-vous') router.push('/mes-rendez-vous');
  else if (label === 'connexion') router.push('/connexion');
};

const handleMobileItem = (item: { label: string; route?: string }) => {
  mobileMenuOpen.value = false;
  const label = item.label.toLowerCase();
  if (label === 'déconnexion') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  } else if (item.route) {
    router.push(item.route);
  }
};

const goToBooking = () => {
  if (route.path === '/') {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    router.push({ path: '/', hash: '#booking' });
  }
};

const goToBookingMobile = () => {
  mobileMenuOpen.value = false;
  goToBooking();
};
</script>

<style scoped>
/* ══ Barre principale ══ */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  height: 64px;
  width: 100%;
}

/* ── Marque ── */
.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1.5px solid var(--border-color);
  flex-shrink: 0;
}
.brand-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* ── Liens desktop ── */
.nav-links {
  display: none;
  align-items: center;
  gap: 2.4rem;
  flex: 1;
  justify-content: center;
}
.nav-item {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  cursor: pointer;
  padding-bottom: 3px;
  border-bottom: 1.5px solid transparent;
  transition: color 0.22s ease, border-color 0.22s ease;
  white-space: nowrap;
}
.nav-item:hover { color: var(--taupe); border-bottom-color: var(--taupe); }

/* ── Actions droite ── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ── CTA desktop ── */
.nav-cta--desktop {
  display: none;
  align-items: center;
  gap: 8px;
  background: var(--taupe);
  color: white;
  border: none;
  padding: 9px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.22s ease;
}
.nav-cta--desktop:hover { background: var(--taupe-dark); }
.nav-cta--desktop .pi { font-size: 0.75rem; }

/* ── Burger mobile ── */
.nav-burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  flex-shrink: 0;
}
.burger-line {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--text-dark);
  transition: all 0.25s ease;
  transform-origin: center;
}
.burger-line:nth-child(1).open { transform: translateY(6.5px) rotate(45deg); }
.burger-line:nth-child(2).open { opacity: 0; transform: scaleX(0); }
.burger-line:nth-child(3).open { transform: translateY(-6.5px) rotate(-45deg); }

/* ══ Menu mobile déroulant ══ */
.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  z-index: 999;
  box-shadow: var(--shadow-md);
}
.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 5%;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dark);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}
.mobile-menu-item:last-child { border-bottom: none; }
.mobile-menu-item:hover { background: var(--blush); color: var(--taupe); }
.mobile-menu-item--cta {
  background: var(--taupe);
  color: white;
}
.mobile-menu-item--cta:hover { background: var(--taupe-dark); color: white; }
.mobile-menu-icon { font-size: 0.85rem; opacity: 0.7; flex-shrink: 0; }
.mobile-menu-item--cta .mobile-menu-icon { opacity: 0.9; }

/* Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  top: 64px;
  background: rgba(42, 30, 28, 0.3);
  z-index: 998;
}

/* Transition menu */
.menu-drop-enter-active { transition: all 0.22s ease; }
.menu-drop-enter-from   { opacity: 0; transform: translateY(-8px); }
.menu-drop-leave-active { transition: all 0.18s ease; }
.menu-drop-leave-to     { opacity: 0; transform: translateY(-8px); }

/* ══ Desktop ══ */
@media (min-width: 760px) {
  .navbar { height: 72px; padding: 0 6%; }
  .brand-name { font-size: 1.45rem; }
  .nav-links { display: flex; }
  .nav-burger { display: none; }
  .nav-cta--desktop { display: inline-flex; }
}
</style>
