<template>
  <div>
    <!-- Bouton Burger -->
    <Button
        class="button-burger"
        outlined
        type="button"
        @click="toggle"
        aria-haspopup="true"
        aria-controls="overlay_menu"
    >
      <i class="pi pi-align-justify icon-burger"></i>
    </Button>

    <!-- Menu Burger -->
    <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true">
      <template #item="{ item }">
        <div class="menu-item" @click="handleItemClick($event, item)">
          {{ item.label }}
          <!-- Sous-menu pour PRESTATIONS -->
          <div v-if="item.label === 'PRESTATIONS' && showSubMenu" class="submenu">
            <div
                v-for="prest in prestations"
                :key="prest.id"
                class="menu-subitem"
                @click.stop="navigateTo(prest.id)"
            >
              {{ prest.name }}
            </div>
          </div>
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
const showSubMenu = ref(false);
const categorieStore = useCategoryStore();
const prestations = ref([]); // Liste des prestations
const loading = ref(false);

// Fonction exécutée lors de l'initialisation du composant (onMounted)
onMounted(async () => {
  try {
    loading.value = true; // Activer le loader pendant la récupération des données
    await categorieStore.fetchEntities(); // Appel à la fonction du store pour fetch les entités
    prestations.value = categorieStore.categories; // Récupérer les catégories du store
  } catch (error) {
    console.error("Erreur lors du fetch des entités:", error);
  } finally {
    loading.value = false; // Désactiver le loader après la récupération des données
  }
});

// Détermine si l'utilisateur est connecté
const isAuthenticated = computed(() => !!localStorage.getItem('token'));

// Fonction pour générer les éléments du menu en fonction de l'état d'authentification
const getMenuItems = () => {
  const items = [
    { label: 'INSTITUT' },
    { label: 'PRESTATIONS' }
  ];

  // Ajoutez "MES RESERVATIONS" si l'utilisateur est authentifié
  if (isAuthenticated.value) {
    items.push({ label: 'MES RENDEZ-VOUS' });
    items.push({ label: 'DECONNEXION' });
  } else {
    items.push({ label: 'CONNEXION' });
  }

  return items;
};

// Définition des éléments du menu
const menuItems = ref(getMenuItems());

// Watcher sur isAuthenticated pour mettre à jour les éléments du menu
watch(isAuthenticated, () => {
  menuItems.value = getMenuItems(); // Met à jour le menuItems en fonction de l'authentification
});

// Toggle du menu
const toggle = (event: MouseEvent) => {
  if (menu.value) {
    menu.value.toggle(event);
  }
};

// Gestion des clics sur les items
const handleItemClick = (event: MouseEvent, item: { label: string }) => {
  // Empêche la fermeture du menu burger lorsqu'on clique sur "PRESTATIONS"
  if (item.label === 'PRESTATIONS') {
    event.stopPropagation();
    showSubMenu.value = !showSubMenu.value;
  } else if (item.label === 'INSTITUT') {
    router.push('/'); // Redirection vers la page d'accueil
  } else if (item.label === 'MES RENDEZ-VOUS') {
  if (isAuthenticated.value) {
    router.push('/mes-rendez-vous');
  }
  } else if (item.label === 'CONNEXION') {
    window.location.href = '/connexion';
  } else if (item.label === 'DECONNEXION') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  } else {
    showSubMenu.value = false; // Ferme la sous-liste si un autre item est cliqué
    menu.value?.hide(); // Ferme le menu burger après avoir sélectionné un autre item
  }
};

// Navigation vers une route spécifique
const navigateTo = (categoryId: number) => {
  router.push(`/prestation/${categoryId}`); // Redirige vers la route avec l'ID de la catégorie
};
</script>

<style scoped>
/* Style du bouton burger */
.button-burger {
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--taupe);
  background-color: var(--beige);
  cursor: pointer;
}

.icon-burger {
  font-size: 30px;
}

/* Style des items du menu */
.menu-item {
  font-size: 1.5em;
  color: var(--taupe);
  text-align: center;
  border: 1px solid var(--taupe);
  background-color: var(--beige);
  cursor: pointer;
  padding-inline: 5px;
}

.menu-subitem {
  color: var(--beige);
  cursor: pointer;
  background-color: var(--taupe);
  border: 1px solid var(--beige);
}
</style>