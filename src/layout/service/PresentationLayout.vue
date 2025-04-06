<template>
  <div v-if="category" class="content">
    <div class="picture">
      <img :src="'https://backoffice.atelier-de-marie.com/images/service/' + category.picture" alt="Image de la catégorie">
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
  width: 100%;
  margin-inline: auto;
}

.picture {
  border-bottom: 2px solid var(--taupe);
  overflow: hidden;
  height: 25vh;
  display: flex; /* Ajout de cette ligne */
  align-items: center; /* Centrer verticalement */
  justify-content: center; /* Centrer horizontalement */
}

img {
  height: auto;
  object-fit: cover; /* Modifiez ici */
  min-width: 100%; /* Ajoutez cette ligne pour empêcher l'étirement */
  min-height: 100%; /* Ajoutez cette ligne pour empêcher l'étirement */
}

.presentation {
  border-bottom: 2px solid var(--taupe);
  margin-bottom: 25px;
}

h1, p {
  text-align: center;
  margin: 0.5em;
  margin-inline: 2em;
  color: var(--taupe);
}

.presentation p {
  text-align: justify;
}
@media (min-width: 500px) {
  .content {
    width: 90%;
    display: flex;
    border-bottom: 2px solid var(--taupe);
  }
  .picture{
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    height: 360px;
    width: 370px;
    padding: 1vh;
    border: none;
  }
  img {
    height: 100%;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }

  .presentation {
    border-bottom: none;
    margin-bottom: 25px;
    width: 70%;
  }

}
</style>
