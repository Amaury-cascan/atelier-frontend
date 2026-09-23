<template>
  <div class="adm-shell">
    <Toast position="top-center" />
    <ConfirmDialog />

    <header class="adm-topbar">
      <button type="button" class="adm-menu-btn" aria-label="Menu" @click="drawerOpen = !drawerOpen">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/admin" class="adm-brand">
        <i class="pi pi-sparkles"></i>
        <span>L'Atelier</span>
      </router-link>
      <div class="adm-topbar-right">
        <span class="adm-user">{{ auth.displayName }}</span>
        <router-link to="/" class="adm-link-site adm-hide-xs">Site</router-link>
        <button type="button" class="adm-logout" @click="logout">Sortir</button>
      </div>
    </header>

    <aside class="adm-sidebar" :class="{ 'adm-sidebar--open': drawerOpen }">
      <p class="adm-sidebar-label">Espace Marie</p>
      <nav class="adm-nav" aria-label="Navigation administration">
        <router-link
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          class="adm-nav-item"
          @click="drawerOpen = false"
        >
          <span class="adm-nav-ico"><i :class="item.icon"></i></span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <div v-if="drawerOpen" class="adm-overlay" @click="drawerOpen = false"></div>

    <main class="adm-main">
      <router-view />
    </main>

    <nav class="adm-bottom" aria-label="Navigation mobile">
      <router-link
        v-for="item in bottomMenu"
        :key="item.to"
        :to="item.to"
        class="adm-bottom-item"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAuthStore } from '@/stores/authStore';

const auth = useAuthStore();
const router = useRouter();
const drawerOpen = ref(false);

const menu = [
  { to: '/admin', label: 'Tableau de bord', icon: 'pi pi-home' },
  { to: '/admin/calendrier', label: 'Calendrier', icon: 'pi pi-calendar' },
  { to: '/admin/horaires', label: 'Horaires', icon: 'pi pi-clock' },
  { to: '/admin/prestations', label: 'Prestations', icon: 'pi pi-list' },
  { to: '/admin/categories', label: 'Catégories', icon: 'pi pi-tags' },
  { to: '/admin/images', label: 'Images', icon: 'pi pi-images' },
  { to: '/admin/clients', label: 'Clients', icon: 'pi pi-users' },
  { to: '/admin/statistiques', label: 'Statistiques', icon: 'pi pi-chart-bar' },
];

const bottomMenu = [
  { to: '/admin', label: 'Accueil', icon: 'pi pi-home' },
  { to: '/admin/calendrier', label: 'Agenda', icon: 'pi pi-calendar' },
  { to: '/admin/clients', label: 'Clients', icon: 'pi pi-users' },
  { to: '/admin/prestations', label: 'Prestations', icon: 'pi pi-list' },
  { to: '/admin/statistiques', label: 'Stats', icon: 'pi pi-chart-bar' },
];

const logout = async () => {
  await auth.signout();
  router.push({ name: 'connexion' });
};
</script>

<style scoped>
.adm-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--adm-bg-glow);
  color: var(--adm-text);
  font-family: var(--adm-font-body);
  --adm-nav-h: 56px;
  --adm-sidebar-w: 268px;
  --adm-bottom-h: 68px;
}

.adm-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--adm-nav-h);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top);
  background: rgba(255, 252, 249, 0.92);
  backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid var(--adm-border);
  box-shadow: 0 1px 0 rgba(255,255,255,0.7) inset;
}
.adm-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--adm-text);
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
}
.adm-menu-btn:hover { background: var(--adm-accent-soft); }

.adm-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--adm-text);
  font-family: var(--adm-font-display);
  font-size: 1.35rem;
  letter-spacing: 0.02em;
}
.adm-brand i { color: var(--adm-accent); font-size: 1rem; }

.adm-topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.adm-user {
  display: none;
  font-size: 0.85rem;
  color: var(--adm-muted);
}
.adm-link-site,
.adm-logout {
  font-size: 0.78rem;
  color: var(--adm-accent);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
}
.adm-logout:hover,
.adm-link-site:hover { text-decoration: underline; }

.adm-sidebar {
  position: fixed;
  z-index: 35;
  top: calc(var(--adm-nav-h) + env(safe-area-inset-top, 0px));
  left: 0;
  width: min(var(--adm-sidebar-w), 88vw);
  height: calc(100dvh - var(--adm-nav-h) - env(safe-area-inset-top, 0px));
  background: rgba(255, 252, 249, 0.98);
  border-right: 1px solid var(--adm-border);
  transform: translateX(-100%);
  transition: transform 0.28s var(--adm-ease);
  padding: 16px 12px calc(var(--adm-bottom-h) + 24px);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.adm-sidebar--open { transform: translateX(0); }

.adm-sidebar-label {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--adm-muted);
  margin: 0 10px 14px;
}

.adm-overlay {
  position: fixed;
  inset: calc(var(--adm-nav-h) + env(safe-area-inset-top, 0px)) 0 0;
  background: rgba(45, 42, 38, 0.35);
  z-index: 30;
}

.adm-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.adm-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  min-height: 48px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--adm-muted);
  font-size: 0.92rem;
  transition: background 0.2s var(--adm-ease), color 0.2s var(--adm-ease), transform 0.2s var(--adm-ease);
  -webkit-tap-highlight-color: transparent;
}
.adm-nav-ico {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #f1ebe4;
  color: var(--adm-muted);
  flex-shrink: 0;
}
.adm-nav-item:hover {
  background: var(--adm-accent-soft);
  color: var(--adm-text);
  transform: translateX(2px);
}
.adm-nav-item:hover .adm-nav-ico,
.adm-nav-item.router-link-active .adm-nav-ico {
  background: var(--adm-accent);
  color: #fff;
}
.adm-nav-item.router-link-active {
  background: var(--adm-accent-soft);
  color: var(--adm-accent-deep);
  font-weight: 600;
}

.adm-main {
  padding: 16px 12px calc(var(--adm-bottom-h) + env(safe-area-inset-bottom, 0px) + 24px);
  max-width: 1440px;
}

.adm-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  min-height: var(--adm-bottom-h);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: rgba(255, 252, 249, 0.96);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--adm-border);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -8px 30px rgba(45, 42, 38, 0.06);
}
.adm-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--adm-muted);
  font-size: 0.58rem;
  letter-spacing: 0.02em;
  min-height: var(--adm-bottom-h);
  padding: 6px 2px;
  -webkit-tap-highlight-color: transparent;
}
.adm-bottom-item i { font-size: 1.15rem; }
.adm-bottom-item.router-link-active { color: var(--adm-accent); font-weight: 600; }

@media (min-width: 960px) {
  .adm-shell { --adm-nav-h: 64px; }
  .adm-menu-btn { display: none; }
  .adm-user { display: inline; }
  .adm-sidebar {
    transform: none;
    width: var(--adm-sidebar-w);
    top: var(--adm-nav-h);
    height: calc(100vh - var(--adm-nav-h));
    padding: 20px 14px;
  }
  .adm-overlay { display: none; }
  .adm-main {
    margin-left: var(--adm-sidebar-w);
    padding: 32px 36px 48px;
  }
  .adm-bottom { display: none; }
  .adm-topbar { padding: 0 18px; }
}
</style>