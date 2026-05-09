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
              :src="'https://backoffice.atelier-de-marie.com/images/service/' + service.picture"
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

    <!-- Dialog pour la connexion/inscription -->
    <Dialog
        v-model:visible="authDialogVisible"
        :modal="true"
        :closable="true"
        header="Connexion ou Inscription"
        @hide="clearAuthDialog"
        class="custom-dialog"
    >
      <p>Vous devez vous connecter ou vous inscrire pour prendre rendez-vous.</p>
      <div class="button-dialog">
        <button @click="redirectToLogin" class="btn-appointment">Se connecter</button>
        <button @click="redirectToSignup" class="btn-appointment">S'inscrire</button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PresentationLayout from "@/layout/service/PresentationLayout.vue";
import Dialog from 'primevue/dialog';
import { useServiceStore, useCategoryStore } from "@/stores/entityStore"; // Importez votre store d'authentification

const router = useRouter();
const route = useRoute();
const serviceStore = useServiceStore();
const categoryStore = useCategoryStore();

const loading = ref(false);
const categoryId = computed(() => Number(route.params.id));

const categoryName = ref(null);
const filteredServices = ref([]);
const dialogVisible = ref(false);
const selectedService = ref(null);
const authDialogVisible = ref(false); // Pour contrôler la visibilité du dialog d'authentification

const fetchAndFilterServices =  () => {
  loading.value = true;
  try {
    Promise.all([serviceStore.fetchEntities(), categoryStore.fetchEntities()])
        .then(() => {
          const category = categoryStore.categories.find(cat => cat.id === categoryId.value);
          categoryName.value = category ? category.name : null;
          const services = serviceStore.services.filter(service => service.category === categoryName.value);
          filteredServices.value = services.filter(
              service => service.price > 0 && service.active !== false
          );
        });
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
};


fetchAndFilterServices();
watch(categoryId, fetchAndFilterServices);

const openDialog = (service) => {
  selectedService.value = service;
  dialogVisible.value = true;
};

const clearSelectedService = () => {
  selectedService.value = null;
};

const handleAppointment = (service) => {
  const token = localStorage.getItem('token');
  if (token === null) { // Vérifiez si l'utilisateur est connecté
    const desiredRoute = { name: 'reservation', params: { service: service.name } };
    localStorage.setItem('desiredRoute', JSON.stringify(desiredRoute)); // Stockage dans localStorage
    authDialogVisible.value = true; // Affichez la pop-up d'authentification
  } else {
    router.push({ name: 'reservation', params: { service: service.name } });
  }
};

const clearAuthDialog = () => {
  authDialogVisible.value = false;
};

const redirectToLogin = () => {
  router.push({ name: 'connexion' });
  clearAuthDialog();
};

const redirectToSignup = () => {
  router.push({ name: 'inscription' });
  clearAuthDialog();
};
</script>

<style scoped>
/* Votre style CSS reste inchangé */
.services-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2vw;
  padding: 20px;
  width: 100%;
  margin-inline: auto;
}
.service-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  width: 100%;
  text-align: left;
  overflow: hidden;
  position: relative;
  height: fit-content;
  padding: 1vh;
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
  width: 130px;
  height: 130px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-radius: 10px;
  margin-left: 5px;
}

img {   /* Largeur de l'image à 100% du conteneur */
  min-width: 100%;
  min-height: 100%; /* Hauteur de l'image à 100% du conteneur */
  object-fit: cover;

}

.service-details {
  padding: 10px;
  flex: 1;
}
.service-name {
  font-size: 1.3em;
  color: var(--taupe);
  margin: 0 0 10px;
  width: 90%;
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
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
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
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.custom-dialog .p-dialog-content {
  background-color: var(--white);
  color: var(--taupe);
  margin-inline: auto;
  width: 90vw;
  font-size: 1.2em;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  padding: 15px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.button-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 50%;
}
@media (min-width: 760px) {
  .services-container {
    width: 90%;
  }
  .service-card{
    width: 40%;
  }
  .custom-dialog .p-dialog-header {
    width: 50vw !important;
  }

  .custom-dialog .p-dialog-content {
    width: 50vw !important;
  }
}

</style>
