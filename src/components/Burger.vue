<template>
  <div>
    <Button
      class="button-burger"
      type="button"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
      aria-label="Menu"
      text
    >
      <i class="pi pi-align-justify icon-burger"></i>
    </Button>

    <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true">
      <template #item="{ item }">
        <div class="burger-item" @click="handleItemClick($event, item)">
          {{ item.label }}
        </div>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import 'primeicons/primeicons.css';
import { useCategoryStore } from "@/stores/entityStore";

const router = useRouter();
const menu = ref<any>(null);
const categorieStore = useCategoryStore();
const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    await categorieStore.fetchEntities();
  } catch (error) {
    console.error("Erreur lors du fetch des entités:", error);
  } finally {
    loading.value = false;
  }
});

const isAuthenticated = computed(() => !!localStorage.getItem('token'));

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

watch(isAuthenticated, () => {
  menuItems.value = getMenuItems();
});

const toggle = (event: MouseEvent) => {
  if (menu.value) {
    menu.value.toggle(event);
  }
};

const handleItemClick = (_event: MouseEvent, item: { label: string }) => {
  const label = item.label.toLowerCase();
  if (label === 'institut') {
    router.push('/');
  } else if (label === 'galerie') {
    router.push('/photos');
  } else if (label === 'mes rendez-vous') {
    if (isAuthenticated.value) router.push('/mes-rendez-vous');
  } else if (label === 'connexion') {
    window.location.href = '/connexion';
  } else if (label === 'déconnexion') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  }
  menu.value?.hide();
};
</script>

<style scoped>
.button-burger {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  cursor: pointer;
  padding: 8px !important;
  color: var(--text-dark) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-burger:hover {
  background: var(--blush) !important;
  border-radius: 8px !important;
}

.icon-burger {
  font-size: 20px;
  color: var(--text-dark);
}

.burger-item {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dark);
  padding: 13px 24px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.burger-item:hover {
  background-color: var(--blush);
  color: var(--taupe);
}
</style>
