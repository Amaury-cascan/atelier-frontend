<template>
  <div class="container">
  <PresentationLayout />
  <div class="card" v-if="isLoaded === false">
    <Accordion class="accordion">
      <h2 style="color: var(--taupe)">Choix de la prestation</h2>
      <AccordionPanel v-for="tab in categories" :key="tab.name" :value="tab.name" class="accordion-panel">
        <AccordionHeader class="accordion-header" :style="{ color: activeTab === tab.name ? 'var(--taupe)' : 'white' }">{{ tab.name }}</AccordionHeader>
        <AccordionContent class="accordion-content">
          <div v-for ="service in services.filter((serv) => serv.category === tab.name)" :key="service.id">
              <div class="service-card">
                <div class="service-details">
                  <div style="display: flex; justify-content: space-between">
                    <div style="display: flex; flex-direction: column">
                      <h3 class="service-name">{{ service.name }}</h3>
                      <div style="display: flex; margin-bottom: 1vh; color: var(--taupe)">
                        <p class="service-price">{{ service.price }}€</p>
                        <p> - </p>
                        <p class="service-duration">{{ service.duration }}min</p>
                      </div>
                    </div>
                    <button @click="handleAppointment(service)" class="reserve-button">
                      Choisir
                    </button>
                  </div>
                  <div style="width: 90%; margin-inline: auto; border-bottom: 1px solid var(--taupe);"></div>
                </div>
              </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <div class="horaire">
      <h2 style="color: var(--taupe)">Horaires d'ouverture ( à partir du 1er septembre 2025)</h2>
      <div class="card-horaire">
        <div class="jour">
          <p><strong>Lundi</strong></p>
          <p>09h30 - 16h00 / 18h30 - 20h00</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Mardi</strong></p>
          <p>Prestation extérieure</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Mercredi</strong></p>
          <p>Fermé</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Jeudi</strong></p>
          <p>Prestation extérieure</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Vendredi</strong></p>
          <p>09h30 - 20h00</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Samedi</strong></p>
          <p>9h30 - 20h00</p>
        </div>
        <div style="width: 75%; margin:1vh auto; border-bottom: 1px solid var(--taupe);"></div>
        <div class="jour">
          <p><strong>Dimanche</strong></p>
          <p>Fermé</p>
        </div>
      </div>
    </div>
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
import {useCategoryStore, useServiceStore} from "@/stores/entityStore"; // Importez votre store
import { useRouter } from 'vue-router';
import Dialog from "primevue/dialog";
import {ref, onMounted } from "vue";
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

const router = useRouter();

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  picture: string;
  category: string;
}

const authDialogVisible = ref(false);
const serviceStore = useServiceStore(); // Instanciez le store pour les services
const categorieStore = useCategoryStore();
const isLoaded = ref(false);

const services = ref<Service[]>([]);
const categories = ref<Categorie[]>([]);

const responsiveOptions = [
  {
    breakpoint: '10024px',
    numVisible: 6,
    numScroll: 1
  },
  {
    breakpoint: '1150px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '500px',
    numVisible: 2,
    numScroll: 1
  }
];

const handleAppointment = (service: any) => {
  const token = localStorage.getItem('token');
  if (token === null) { // Vérifiez si l'utilisateur est connecté
    console.log(service.name)
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
  isLoaded.value = true;
  try {
    const allServices = await serviceStore.fetchEntities();
    services.value = allServices.filter(service => service.price > 0 && service.active !== false);
    categories.value = await categorieStore.fetchEntities();
    isLoaded.value = false;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    isLoaded.value = false;
  }

});

</script>

<style scoped>
.card {
  width: 100%;
  margin: 0 auto;
}

img {
  min-height: 100%;
  min-width: 100%;
  object-fit: contain;
}

.service-details {
  padding-top: 1vh;
  padding-inline: 5px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
}

.service-name {
  color: var(--taupe);
  margin-bottom: 2px;
  font-size: 0.9em;
  font-weight: bold;
}
.horaire {
  margin-top: 2vh;
  width: 90%;
  margin-inline: auto;
  font-size: 0.8em;

}
.card-horaire {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 2vh;
  font-size: 1.2em;
}
.jour {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1vh;
  color: var(--taupe);
}
.reserve-button {
  background-color: var(--taupe);
  color: white !important;
  border: none;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  margin-top: 5px;
  width: fit-content;
  height: fit-content;
}
.reserve-button:hover {
  transform: scale(1.1);
}
.custom-dialog .p-dialog-content {
  background-color: var(--beige);
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

.accordion{
  width: 90%;
  margin: 0 auto;
}
.accordion-panel{
  border: none !important;
  font-size: 1.2em;
}

.accordion-header{
  background-color: var(--taupe);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 1.2em;
  cursor: pointer;
  border-radius: 5px !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  margin-top: 2vh;
}
.accordion-header:hover{
  background-color: var(--taupe) !important;
}
.accordion-header:focus{
  background-color: var(--taupe) !important;
}

@media (min-width: 760px) {
  .card{
    display: flex;
    justify-content: space-around;
  }
  .accordion{
    width: 50%;
    margin: 0 0;
  }
  .service-card{
    width: 100%;
  }
  .horaire {
    width: fit-content;
    font-size: 1.2em;
    margin: 0;
  }
  .card-horaire {
    margin-top: 1.5vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border-radius: 5px !important;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    padding: 2vh;
    font-size: 1em;
  }
  .jour {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--taupe);
  }
}
</style>
