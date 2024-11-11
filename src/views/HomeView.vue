<template>
  <div class="container">
  <PresentationLayout />
  <div class="card">
    <Carousel
        :value="services"
        :numVisible="2"
        :numScroll="2"
        :responsiveOptions="responsiveOptions"
        circular
        :autoplayInterval="3000"
    >
      <template #item="slotProps">
        <div class="service-item">
          <div class="service-image-container">
            <img
                :src="'https://backoffice.atelier-de-marie.com/images/service/' + slotProps.data.picture"
                alt="Service image"
                class="service-image"
            />
            <span class="category-badge">{{ slotProps.data.category }}</span>
          </div>
          <div class="service-details">
            <h3 class="service-name">{{ slotProps.data.name }}</h3>
            <button @click="handleAppointment(slotProps.data)" class="reserve-button">
              Prendre Rendez-vous
            </button>
          </div>
        </div>
      </template>
    </Carousel>
  </div>
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

<script setup lang="ts">
import PresentationLayout from "@/layout/home/PresentationLayout.vue";
import Carousel from "primevue/carousel";
import { useServiceStore } from "@/stores/entityStore"; // Importez votre store
import { useRouter } from 'vue-router';
import Dialog from "primevue/dialog";
import {ref, onMounted } from "vue";
import { computed } from "vue";
const router = useRouter();

const authDialogVisible = ref(false);



const serviceStore = useServiceStore(); // Instanciez le store pour les services

const services = computed(() => serviceStore.services);
const responsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 1,
    numScroll: 1
  },
  {
    breakpoint: '480px',
    numVisible: 2,
    numScroll: 1
  }
];

const handleAppointment = (service: string) => {
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

onMounted(async () => {
  await serviceStore.fetchEntities();
});

</script>

<style scoped>
.card {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.service-item {
  height: 250px;
  border-radius: 10px;
  margin-inline: 5px;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  background: rgba(245, 223, 198, 0.82);
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  overflow: hidden;
}

.service-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-bottom: 2px solid var(--taupe);
}

.service-image {
  width: 100%;
  object-fit: cover;
}
img {
  min-height: 100%;
  min-width: 100%;
  object-fit: contain;
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--taupe);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8em;
}

.service-details {
  text-align: center;
  padding-top: 5px;
  padding-inline: 5px;
  padding-bottom: 0;
}

.service-name {
  color: var(--taupe);
  margin-bottom: 2px;
  font-size: 0.9em;
  font-weight: bold;
}

.reserve-button {
  background-color: var(--taupe);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 5px 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  transition: transform 0.3s ease;
  width: 90%;
}
.reserve-button:hover {
  transform: scale(1.1), translateX(-50%);
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
.button-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 50%;
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
</style>
