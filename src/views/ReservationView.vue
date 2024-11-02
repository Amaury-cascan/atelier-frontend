<template>
  <div class="reservation-container">
    <h1>Réservation</h1>
    <div v-if="service">
      <div class="infos-div">
        <div class="picture">
          <img :src="'https://backoffice.atelier-de-marie.com/images/service/' + service.picture" alt="Service image" />
        </div>
        <h2>{{ service.name }}</h2>
        <p>{{ service.description }}</p>
        <p><strong>Durée : </strong>{{ service.duration }} min</p>
        <p><strong>Tarif : </strong>{{ service.price }}€</p>

        <div class="form-group">
          <label for="date">Choisissez une date :</label>
          <DatePicker
              id="date"
              v-model="reservation.date"
              :showIcon="true"
              :minDate="minDate"
              :disabledDays="[0]"
              dateFormat="dd/mm/yy"
              class="styled-datepicker"
              showButtonBar
              panelClass="custom-datepicker"
              @date-select="updateAvailableTimes"
          />
        </div>

        <div class="form-group" v-if="reservation.date">
          <label for="time">Choisissez une heure :</label>
          <Select
              id="time"
              v-model="reservation.time"
              :options="availableTimes"
              optionLabel="label"
              optionValue="value"
              placeholder="Sélectionnez une heure"
              required
              class="styled-select"
          />
        </div>

        <Button label="Confirmer la réservation" icon="pi pi-check" class="btn-submit" @click="submitReservation" />
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
    <p>Réservation confirmée avec succès pour la prestation : {{ service.name }} le {{ reservation.date ? reservation.date.toLocaleDateString() : '' }} à {{ reservation.time }}.</p>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceStore } from "@/stores/entityStore";
import axios from 'axios';

// Importation des composants PrimeVue
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from 'primevue/button';
import Dialog from 'primevue/dialog'; // Importation du composant Dialog

const route = useRoute();
const serviceStore = useServiceStore();
const service = ref(null);
const reservation = ref({
  date: null,
  time: ''
});

const minDate = new Date();

const fetchServices = async () => {
  await serviceStore.fetchEntities(); // Assurez-vous de charger les services d'abord
  fetchService(); // Puis récupérez le service
};

const fetchService = () => {
  const serviceName = route.params.service;
  service.value = serviceStore.services.find(s => s.name === serviceName);

};


const availableTimes = ref([]);
const appointments = ref([]);
const showDialog = ref(false); // État de la modal

// Fonction pour récupérer les rendez-vous existants via l'API
const fetchAppointments = async () => {
  try {
    const response = await axios.get(`https://backoffice.atelier-de-marie.com/api/appointment/list`);
    appointments.value = response.data.appointments;
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
  }
};


// Fonction pour mettre à jour les créneaux horaires disponibles
const updateAvailableTimes = () => {
  const startHour = 10; // Heure de début (10h)
  const endHour = 18;   // Heure de fin (18h)
  const endMinute = 30; // Limite à 18h30
  const interval = 30;   // Intervalle de 30 minutes
  let times = [];
  const now = new Date();
  const localTimeOffset = now.getTimezoneOffset() * 60000; // Décalage horaire local en millisecondes

  // Récupérer la date sélectionnée au format correct
  const selectedDate = reservation.value.date;

  // Si aucune date n'est sélectionnée, ne rien faire
  if (!selectedDate) return;

  // Obtenez la date locale
  const selectedDateLocal = new Date(selectedDate.getTime() - localTimeOffset);

  // Format de la date sélectionnée
  const selectedDateString = selectedDateLocal.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'

  // Filtrer les rendez-vous pour la date sélectionnée
  const appointmentsForSelectedDate = appointments.value.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toISOString().split('T')[0] === selectedDateString;
  });

  // Vérifier les heures disponibles
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > endMinute) break; // Limite à 18h30

      const time = new Date(selectedDateLocal);
      time.setHours(hour, minute, 0, 0); // Utilisation de la date sélectionnée

      // Vérifiez que l'heure n'est pas dans le passé
      if (time > now) {
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSlotTaken = isTimeSlotTaken(timeString, appointmentsForSelectedDate);

        if (!isSlotTaken) {
          times.push({ label: timeString, value: timeString });
        }
      }
    }
  }
  availableTimes.value = times;
};

// Vérifie si un créneau est déjà réservé
const isTimeSlotTaken = (time, appointmentsForSelectedDate) => {
  const [hour, minute] = time.split(':').map(Number);

  // Créez une date pour l'heure sélectionnée
  const selectedTimeDate = new Date(reservation.value.date); // Utilisez la date de réservation
  selectedTimeDate.setHours(hour, minute); // Définir l'heure du créneau

  const serviceDuration = service.value.duration; // Durée du service en minutes
  const selectedEndTimeDate = new Date(selectedTimeDate.getTime() + serviceDuration * 60000); // Heure de fin du créneau

  // Vérifiez pour chaque rendez-vous si le créneau horaire est pris
  return appointmentsForSelectedDate.some(appointment => {
    const appointmentStart = new Date(appointment.date);
    const appointmentEnd = new Date(appointment.endDate);

    // Vérifier le chevauchement
    return (
        // 1. Le créneau commence pendant un rendez-vous existant
        (selectedTimeDate >= appointmentStart && selectedTimeDate < appointmentEnd) ||
        // 2. La fin du créneau sélectionné chevauche le début d'un rendez-vous existant
        (selectedEndTimeDate > appointmentStart && selectedEndTimeDate <= appointmentEnd) ||
        // 3. Le créneau commence avant un rendez-vous existant et finit après le début de ce dernier
        (selectedTimeDate < appointmentEnd && selectedEndTimeDate > appointmentStart)
    );
  });
};




// Soumettre la réservation
const submitReservation = async () => {
  if (reservation.value.date && reservation.value.time) {
    const reservationDateTime = new Date(reservation.value.date);
    const [hour, minute] = reservation.value.time.split(':').map(Number);
    reservationDateTime.setHours(hour, minute);

    const user = JSON.parse(localStorage.getItem('user'));
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
      const response = await axios.post('https://backoffice.atelier-de-marie.com/api/appointment/create', payload);
      if (response.data.success) {
        showDialog.value = true;
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
  max-width: 800px;
  margin: auto;
  background-color: var(--beige);
  border-radius: 10px;
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
}

.infos-div p {
  text-align: justify;
  padding-inline: 20px;
}

.styled-datepicker {
  width: 100%;
  font-size: 1.1em;
  color: var(--taupe);
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--taupe);
}

.custom-datepicker .p-datepicker-header {
  background-color: var(--taupe);
  color: white;
}

.custom-datepicker .p-datepicker-today,
.custom-datepicker .p-datepicker-current-day {
  background-color: var(--taupe);
  color: white;
  font-weight: bold;
}

.custom-datepicker .p-datepicker-next,
.custom-datepicker .p-datepicker-prev {
  color: white;
}

.custom-datepicker .p-datepicker-cell:hover {
  background-color: var(--taupe);
  color: white;
}

.btn-submit {
  background-color: var(--taupe);
  color: white;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

label {
  color: var(--taupe);
}

.picture {
  width: 40vh;
  height: 35vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 2px solid var(--taupe);
  border-radius: 10px;

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
  color: var(--taupe);
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--taupe);
}

.styled-select:focus {
  outline: none;
  border-color: var(--taupe);
}



</style>
