<template>
  <PresentationLayout/>
  <div class="services-container">
    <div v-for="service in serviceStore.services" :key="service.id" class="service-card">
      <div class="icon-container">
        <i class="pi pi-info-circle service-info-icon" @click="openDialog(service)"></i>
      </div>
      <div>
        <h2 class="service-name">{{ service.name }}</h2>
      </div>
      <div class="service-content">
        <div class="service-image">
          <img :src="'https://localhost:8000/images/service/' + service.picture" alt="Service image"  />
        </div>
        <div class="service-details">
          <p class="service-price">Prix: {{ service.price }}€</p>
          <p class="service-duration">Durée: {{ service.duration }} min</p>
          <button @click="handleAppointment(service)" class="btn-appointment">Prendre Rendez-vous</button>
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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PresentationLayout from "@/layout/service/PresentationLayout.vue";
import Dialog from 'primevue/dialog';
import { useServiceStore } from "@/stores/entityStore";
import {useRouter} from "vue-router";

const router = useRouter();
const serviceStore = useServiceStore(); // Utilisation du store pour les services
const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true; // Activer le loader pendant la récupération des données
    await serviceStore.fetchEntities(); // Appel à la fonction du store pour fetch les entités
  } catch (error) {
    console.error("Erreur lors du fetch des entités:", error);
  } finally {
    loading.value = false; // Désactiver le loader après la récupération des données
  }
});

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
  // Utilisation de $router pour rediriger vers la page de réservation avec le nom du service en paramètre
  router.push({ name: 'reservation', params: { service: service.name } });
};
</script>

<style>
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
  width: 150px; /* Largeur fixe de l'image */
  height: auto; /* Hauteur automatique pour garder le ratio d'aspect */
  border-bottom-left-radius: 8px; /* Arrondir le bas gauche */
  overflow: hidden;
}
img {
  width: 100%; /* L'image prend 100% de la largeur du conteneur */
  height: 100%; /* L'image prend 100% de la hauteur du conteneur */
  object-fit: contain;
}

.service-details {
  padding: 10px; /* Réduit le padding */
  flex: 1;
}

.service-name {
  font-size: 1.3em;
  color: var(--taupe);
  margin: 0 0 10px;

}

.service-price, .service-duration {
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
