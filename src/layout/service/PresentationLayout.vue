<template>
  <div v-if="category" class="content">
    <div class="picture">
      <img :src="'https://127.0.0.1:8000/images/service/' + category.picture" alt="Image de la catégorie">
    </div>
    <div class="presentation">
      <h1>{{ category.name }}</h1>
      <p>{{ category.description }}</p>
    </div>
  </div>
  <div v-else>
    <p>Chargement des prestations...</p>
  </div>
</template>

<script setup >
import { useCategoryStore } from "@/stores/entityStore";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

// Utilisation du store et de la route
const categoryStore = useCategoryStore();
const route = useRoute();

const category = ref(null);


// Récupération de l'ID de catégorie depuis l'URL
const categoryId = computed(() => Number(route.params.id));

// Fonction pour charger la catégorie en fonction de l'ID
const loadCategory = () => {
  category.value = categoryStore.categories.find(cat => cat.id === categoryId.value);
  if (!category.value) {
    console.warn("Catégorie non trouvée pour l'ID:", categoryId.value);
  }
};

// Charger toutes les entités lors de l'initialisation du composant
categoryStore.fetchEntities().then(loadCategory);

// Watch pour surveiller les changements de `categoryId` et recharger la catégorie
watch(categoryId, loadCategory);
</script>

<style scoped>
.content {
  text-align: center;
}

.picture {
  border-bottom: 2px solid var(--taupe);
  overflow: hidden;
  height: 37vh;
}

img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.presentation {
  border-bottom: 2px solid var(--taupe);
  margin-bottom: 25px;
}

h1, p {
  text-align: center;
  margin: 0.5em;
  color: var(--taupe);
}
</style>
