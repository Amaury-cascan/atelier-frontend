<template>
  <PresentationLayout/>
  <div class="services-container">
    <div
        v-for="service in filteredServices"
        :key="service.id"
        class="service-card"
    >
      <div class="icon-container">
        <i
            class="pi pi-info-circle service-info-icon"
            @click="openDialog(service)"
        ></i>
      </div>
      <div>
        <h2 class="service-name">{{ service.name }}</h2>
      </div>
      <div class="service-content">
        <div class="service-image">
          <img
              :src="'https://127.0.0.1:8000/images/service/' + service.picture"
              alt="Service image"
          />
        </div>
        <div class="service-details">
          <p class="service-price">Prix: {{ service.price }}€</p>
          <p class="service-duration">Durée: {{ service.duration }} min</p>
          <button @click="handleAppointment(service)" class="btn-appointment">
            Prendre Rendez-vous
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog pour afficher la description du service -->
    <Dialog
        v-model:visible="dialogVisible"
        :modal="true"
        :closable="true"
        :header="selectedService?.name"
        @hide="clearSelectedService"
        class="custom-dialog"
    >
      <p>{{ selectedService?.description }}</p>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PresentationLayout from "@/layout/service/PresentationLayout.vue";
import Dialog from 'primevue/dialog';
import { useServiceStore, useCategoryStore } from "@/stores/entityStore";

const router = useRouter();
const route = useRoute();
const serviceStore = useServiceStore();
const categoryStore = useCategoryStore();
const loading = ref(false);

const categoryId = computed(() => Number(route.params.id)); // Récupérer l'ID de catégorie depuis l'URL

// Charger les catégories et services, puis filtrer en fonction du nom de la catégorie
const categoryName = ref(null);
const filteredServices = ref([]);

const fetchAndFilterServices =  () => {
  loading.value = true;
  try {
    // Charger les catégories et services
     Promise.all([serviceStore.fetchEntities(), categoryStore.fetchEntities()]);

    // Trouver le nom de la catégorie actuelle en fonction de `categoryId`
    const category = categoryStore.categories.find(cat => cat.id === categoryId.value);
    categoryName.value = category ? category.name : null;

    // Filtrer les services par nom de catégorie
    filteredServices.value = serviceStore.services.filter(service => service.category === categoryName.value);
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
};

// Appeler fetchAndFilterServices initialement pour peupler les services
fetchAndFilterServices();

// Mettre à jour les services filtrés lorsque `categoryId` change
watch(categoryId, fetchAndFilterServices);

const dialogVisible = ref(false);
const selectedService = ref(null);

const openDialog = (service) => {
  selectedService.value = service;
  dialogVisible.value = true;
};

const clearSelectedService = () => {
  selectedService.value = null;
};

const handleAppointment = (service) => {
  router.push({ name: 'reservation', params: { service: service.name } });
};
</script>

<style scoped>
/* Votre style CSS reste inchangé */
.services-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}
.service-card {
  background-color: var(--beige);
  border-radius: 8px;
  box-shadow: 5px 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  text-align: left;
  overflow: hidden;
  position: relative;
  height: 175px;
}
.service-content {
  height: 139px;
  align-items: flex-start;
  display: flex;
}
.icon-container {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
.service-info-icon {
  font-size: 24px;
  color: var(--taupe);
}
.service-image {
  width: 150px;          /* Largeur du conteneur */
  height: 100%;          /* Hauteur du conteneur */
  overflow: hidden;      /* Masque tout débordement */
  display: flex;
  align-items: center;   /* Centre verticalement */
  justify-content: center; /* Centre horizontalement */
}

img {   /* Largeur de l'image à 100% du conteneur */
  height: 100%;          /* Hauteur de l'image à 100% du conteneur */
  object-fit: cover;   /* Affiche toute l'image en conservant le ratio */
}

.service-details {
  padding: 10px;
  flex: 1;
}
.service-name {
  font-size: 1.3em;
  color: var(--taupe);
  margin: 0 0 10px;
}
.service-price,
.service-duration {
  font-size: 1.1em;
  color: var(--taupe);
  margin: 5px 0;
}
.btn-appointment {
  background-color: var(--taupe);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 5px 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
}
.btn-appointment:hover {
  background-color: var(--taupe);
}
.custom-dialog .p-dialog-header {
  background-color: var(--taupe);
  margin-inline: auto;
  color: white;
  font-size: 1.2em;
  width: 90vw;
  padding: 15px;
  box-shadow: 10px 10px 8px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.custom-dialog .p-dialog-content {
  background-color: var(--beige);
  color: var(--taupe);
  margin-inline: auto;
  width: 90vw;
  font-size: 1.2em;
  box-shadow: 10px 10px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
</style>
