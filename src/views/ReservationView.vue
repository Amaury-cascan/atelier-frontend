<template>
  <div class="reservation-container">
    <h1>Réservation</h1>
    <div v-if="service" class="infos-div">
      <div class="content-div">
        <div class="ordi">
          <div class="form-group">
            <label class="label-date" for="date">Choisissez une date :</label>
            <ModernCalendar
              ref="calendarRef"
              id="date"
              v-model="reservation.date"
              :disabledDays="daysDisabled"
              :minDate="new Date()"
              :service="service"
              :appointments="appointments"
              @time-selected="onTimeSelected"
            />
          </div>

          <div v-if="reservation.date && reservation.time" class="selected-time-display">
            <div class="time-selected">
              <i class="pi pi-clock"></i>
              <span>Créneau sélectionné : <strong>{{ reservation.time }}</strong></span>
              <button class="change-time-btn" @click="changeTime">
                <i class="pi pi-pencil"></i>
                Modifier
              </button>
            </div>
            <Button label="Confirmer la réservation" icon="pi pi-check" class="btn-submit" @click="submitReservation" />
          </div>

         
        </div>
        
        <div class="text">
          <h2>{{ service.name }}</h2>
          <p>{{ service.description }}</p>
          <p><strong>Durée : </strong>{{ service.duration }} min</p>
          <p><strong>Tarif : </strong>{{ service.price }}€</p>
        </div>
      </div>
      <div class="mobile">
        <div class="form-group">
          <label for="date">Choisissez une date :</label>
          <ModernCalendar
            ref="calendarRef"
            id="date"
            v-model="reservation.date"
            :disabledDays="daysDisabled"
            :minDate="new Date()"
            :service="service"
            :appointments="appointments"
            @time-selected="onTimeSelected"
          />
        </div>
        <div v-if="reservation.date && reservation.time" class="selected-time-display">
          <div class="time-selected">
            <i class="pi pi-clock"></i>
            <span>Créneau sélectionné : <strong>{{ reservation.time }}</strong></span>
            <button class="change-time-btn" @click="changeTime">
              <i class="pi pi-pencil"></i>
              Modifier
            </button>
          </div>
          <Button label="Confirmer la réservation" icon="pi pi-check" class="btn-submit" @click="submitReservation" />
        </div>
        
      </div>  
    </div>
    <div v-else>
      <p>Chargement...</p>
    </div>

    <!-- Modal de confirmation -->
    <Dialog
        v-model:visible="showDialog"
        header="Confirmation"
        :closable="true"
        :modal="true"
        class="custom-dialog"
    >
      <p>Réservation confirmée avec succès pour la prestation : {{ service?.name }} le {{ reservation.date ? reservation.date.toLocaleDateString() : '' }} à {{ reservation.time }}.</p>
      <br>
      <p>Un email de confirmation vient de vous être envoyé. Nous vous invitons à vérifier votre boîte mail, y compris les courriers indésirables (spam), pour vous assurer de l’avoir bien reçu.</p>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceStore } from "@/stores/entityStore";
import axios from 'axios';

// Interfaces
interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  picture: string;
}

interface Appointment {
  date: string;
  endDate: string;
}



// Importation des composants PrimeVue et personnalisés
import ModernCalendar from "@/components/ModernCalendar.vue";
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';


const route = useRoute();
const router = useRouter();
const serviceStore = useServiceStore();
const service = ref<Service | null>(null);
const daysDisabled = ref([]); // Logique de restriction gérée directement dans ModernCalendar
const reservation = ref<{date: Date | null, time: string}>({
  date: null,
  time: ''
});

// Référence au composant calendrier
const calendarRef = ref();


const fetchServices = async () => {
  await serviceStore.fetchEntities(); // Assurez-vous de charger les services d'abord
  fetchService(); // Puis récupérez le service
};

const fetchService = () => {
  const serviceName = route.params.service as string;
  if (serviceStore.services && Array.isArray(serviceStore.services)) {
    service.value = serviceStore.services.find((s: Service) => s.name === serviceName) || null;
  }
};


const appointments = ref<Appointment[]>([]);
const showDialog = ref(false); // État de la modal

// Fonction pour récupérer les rendez-vous existants via l'API
const fetchAppointments = async () => {
  try {
    const response = await axios.get(`http://localhost:8000/api/appointment/list`);
    appointments.value = response.data.appointments;
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
  }
};


// Fonction appelée quand un horaire est sélectionné dans la popup
const onTimeSelected = (selectedTime: string) => {
  reservation.value.time = selectedTime;
};

// Fonction pour changer l'heure (rouvrir la popup)
const changeTime = () => {
  if (calendarRef.value && reservation.value.date) {
    // Ouvrir la popup via la méthode exposée du calendrier
    calendarRef.value.openTimeSlotsPopup();
  }
};






// Soumettre la réservation
const submitReservation = async () => {
  if (reservation.value.date && reservation.value.time && service.value) {
    const reservationDateTime = new Date(reservation.value.date);
    const [hour, minute] = reservation.value.time.split(':').map(Number);
    reservationDateTime.setHours(hour, minute);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : null;

    if (!userId) {
      alert('Utilisateur non connecté. Veuillez vous connecter pour effectuer une réservation.');
      return;
    }

    const localTimezoneOffset = reservationDateTime.getTimezoneOffset();
    const utcDateTime = new Date(reservationDateTime.getTime() - localTimezoneOffset * 60000);

    const payload = {
      date: utcDateTime.toISOString(),
      serviceId: service.value.id,
      clientId: userId
    };

    try {
      const response = await axios.post('http://localhost:8000/api/appointment/create', payload);
      if (response.data.success) {
        showDialog.value = true; // Affiche le Dialog de confirmation
        // Attendre 3 secondes avant de changer de route
        setTimeout(() => {
          showDialog.value = false; // Ferme le Dialog
          router.push('/mes-rendez-vous'); // Redirection vers la page des rendez-vous
        }, 10000); // Délai de 10 secondes
      } else {
        alert(response.data.message || 'Une erreur est survenue lors de la réservation.');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
      alert('Une erreur est survenue lors de la réservation.');
    }
  } else {
    alert('Veuillez choisir une date et une heure pour la réservation.');
  }
};


fetchServices();
fetchAppointments();

</script>

<style scoped>
/* Ajoutez ici vos styles existants */
.reservation-container {
  padding: 20px 0;
  border-radius: 10px;
  width: 100%;
  margin-inline: auto;
}

h1 {
  font-size: 2em;
  color: var(--taupe);
  margin-bottom: 20px;
  text-align: center;
}

.infos-div {
  color: var(--taupe);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2vh;
  margin-inline: auto;
}

.infos-div p {
  text-align: justify;
}

.pi-pencil {
  color: white !important;
}



.btn-submit {
  background-color: var(--taupe);
  color: white;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
}

.label-date {
  color: var(--taupe);
  font-size: 1.1em;
  font-weight: bold;
  margin-left: 20px;
  margin-bottom: 20px;
}
.text{
  margin: 2vh;
}

.picture {
  width: 40vh;
  height: 35vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-inline: auto;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-radius: 10px;

}
strong{
  font-weight: bold;
}

.picture img {
  height: auto;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
}

.form-group {
  padding-inline: 20px;
  margin-bottom: 10px;
}

.styled-select {
  width: 100%;
  font-size: 1.1em;
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--taupe);
}

.styled-select:focus {
  outline: none;
  border-color: var(--taupe);
}

.selected-time-display {
  padding-inline: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.time-selected {
  background: linear-gradient(135deg, #f8f6f3 0%, #ede8e0 100%);
  border: 2px solid var(--taupe);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 400px;
  margin:0 10px;
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.1);
  animation: slideIn 0.3s ease-out;
}

.time-selected i {
  color: var(--taupe);
  font-size: 1.2rem;
}

.time-selected span {
  flex: 1;
  font-size: 1.1rem;
  color: var(--taupe);
}

.time-selected strong {
  color: var(--taupe);
  font-weight: 600;
}

.change-time-btn {
  background: var(--taupe);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.change-time-btn:hover {
  background: var(--taupe);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.3);
}
.ordi {
    display:none
  } 
  .mobile {
    display:block;
  }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


@media (min-width: 760px) {
  .ordi {
    display:block
  } 
  .mobile {
    display:none;
  }
  .reservation-container {
    width: 90vw;
  }
  .infos-div{
    align-items: center;
    width: 90%;
  }
  .content-div{
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 4vh;
  }
  .text{
    width: 60%;
  }
}

</style>
