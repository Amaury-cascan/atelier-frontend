<template>
  <router-link to="/" class="image-container">
    <img src="../assets/logo/1.png" alt="L'Atelier de Marie">
  </router-link>
  <router-link to="/" class="h1-phone"><h1>L'Atelier de Marie</h1></router-link>
  <Burger class="burger" />
  <div class="menu">
    <router-link to="/" class="h1-full"><h1>L'Atelier de Marie</h1></router-link>
    <div class="sub-menu">
      <div v-for="(item, index) in menuItems" :key="index" >
        <div class="menu-item" @click="handleItemClick($event, item)">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Burger from '../components/Burger.vue';
import {useRouter} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import {useCategoryStore} from "@/stores/entityStore";


const router = useRouter();
const menu = ref<any>(null);
const showSubMenu = ref(false);

// Détermine si l'utilisateur est connecté
const isAuthenticated = computed(() => !!localStorage.getItem('token'));

// Fonction pour générer les éléments du menu en fonction de l'état d'authentification
const getMenuItems = () => {
  const items = [
    { label: 'INSTITUT' },
    {label: 'PHOTOS'}
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
  } else if (item.label === 'PHOTOS') {
    router.push('/photos');
  }
  else if (item.label === 'MES RENDEZ-VOUS') {
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
img {
  width: 100%;
  height: 120%;
  object-fit: cover;
}
h1 {
  color: #a14b33;
  font-family: "Bona Nova SC", serif;
}

.image-container {
  width: 4em; /* Largeur du conteneur */
  height: 4em; /* Hauteur du conteneur */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.menu{
  display: none;
}
@media (min-width: 760px) {
  .burger {
    display: none;
  }
  .image-container {
    display: none;
  }
  .h1-phone {
    display: none;
  }
  h1{
    font-size: 5vw;
  }
  .menu{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .menu-item {
    font-size: 1.5em;
    color: var(--taupe);
    text-align: center;
    cursor: pointer;
    padding-inline: 5px;
    width: 15vw;
    position: relative;
  }
  .menu-subitem {
    color: var(--beige);
    cursor: pointer;
    background-color: var(--taupe);
    border: 1px solid var(--beige);
    width: 100%;
  }
  .sub-menu{
    border-top: 1px solid var(--taupe);
    display: flex;
    justify-content: space-around;
    width: 100%;
    gap: 4vw;
  }
  .items-prestation{
    position: absolute;
    margin-inline: auto;
    width: 100%;
    z-index: 1000;
  }
}


</style>
