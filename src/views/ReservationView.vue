<template>
  <div class="reservation-container">
    <h1>Réservation</h1>
    <div v-if="service">
      <div class="infos-div">
        <div class="picture">
          <img :src="'https://localhost:8000/images/service/' + service.picture" alt="Service image" />
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

        <Button label="Confirmer la réservation" icon="pi pi-check" type="submit" class="btn-submit" @click="submitReservation" />
      </div>
    </div>
    <div v-else>
      <p>Prestation introuvable.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useServiceStore } from "@/stores/entityStore";
import axios from 'axios';

// Importation des composants PrimeVue
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from 'primevue/button';

const route = useRoute();
const serviceName = route.params.service;
const serviceStore = useServiceStore();
const service = ref(null);
const reservation = ref({
  date: null,
  time: ''
});


const minDate = new Date();

service.value = serviceStore.services.find(s => s.name === serviceName);

const availableTimes = ref([]);
const appointments = ref([]);

// Fonction pour récupérer les rendez-vous existants via l'API
const fetchAppointments = async () => {
  try {
    const response = await axios.get(`https://localhost:8000/api/appointment/list`);
    appointments.value = response.data.appointments;
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
  }
};

// Fonction pour mettre à jour les créneaux horaires disponibles
const updateAvailableTimes = () => {
  const startHour = 10; // Heure de début (10h)
  const endHour = 18;   // Heure de fin (18h)
  const endMinute = 30; // Minutes à ajouter pour 18h30
  const interval = 30;   // Intervalle de 30 minutes
  let times = [];
  const now = new Date();
  const isToday = reservation.value.date && reservation.value.date.toDateString() === now.toDateString();

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      // On ne doit pas dépasser 18h30
      if (hour === endHour && minute > endMinute) break;

      const time = new Date();
      time.setHours(hour, minute, 0, 0);

      // Filtrer les créneaux passés
      if (!isToday || time > now) {
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSlotTaken = isTimeSlotTaken(reservation.value.date, timeString);

        if (!isSlotTaken) {
          times.push({ label: timeString, value: timeString });
        }
      }
    }
  }
  availableTimes.value = times;
};


// Fonction pour vérifier si un créneau est déjà réservé
const isTimeSlotTaken = (selectedDate, time) => {
  if (!selectedDate) return false;

  const selectedDateString = selectedDate.toDateString();

  return appointments.value.some(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === selectedDateString &&
        appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time;
  });
};

fetchAppointments();

const submitReservation = () => {
  if (reservation.value.date && reservation.value.time) {
    alert(`Réservation confirmée pour le service ${serviceName} le ${reservation.value.date.toLocaleDateString()} à ${reservation.value.time}.`);
  } else {
    alert('Veuillez choisir une date et une heure pour la réservation.');
  }
};
</script>

<style scoped>
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
  margin-inline: auto;
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
  width: 100%;
  height: 25vh;
  display: flex;
  justify-content: center;  /* Centrer horizontalement */
  align-items: center;      /* Centrer verticalement */
  overflow: hidden;         /* Masquer tout dépassement de l'image */
  position: relative;       /* Assure un positionnement relatif pour le centrage */
}

.picture img {
  width: 100%;
  height: auto;            /* Assure que l'image prenne toute la hauteur sans déformer le ratio */
  object-fit: contain;      /* Maintient le ratio d'aspect et adapte l'image à la div */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);  /* Recentre l'image en fonction de son centre */
}
.form-group {
  padding-inline: 20px;
  margin-bottom: 10px;
}

.styled-select {
  width: 100%; /* Full width */
  padding: 10px; /* Padding for better spacing */
  font-size: 1.1em; /* Font size */
  color: var(--taupe); /* Text color */
  background-color: var(--beige); /* Background color */
  border: 2px solid var(--taupe); /* Border color */
  border-radius: 8px; /* Rounded corners */
  transition: border-color 0.3s ease; /* Smooth transition for border color */
}

/* Change border color on focus */
.styled-select:focus {
  border-color: var(--taupe); /* Change to a darker color when focused */
  outline: none; /* Remove the default outline */
}

/* Style the dropdown arrow */
.p-dropdown-trigger {
  background-color: var(--taupe); /* Dropdown arrow background */
  border-radius: 0 8px 8px 0; /* Match the select border radius */
}

/* Adjust the dropdown panel */
.p-dropdown-panel {
  border-radius: 8px; /* Match the select border radius */
  border: 2px solid var(--taupe); /* Match the select border */
}

/* Additional styling for the items */
.p-dropdown-item {
  padding: 10px; /* Padding for dropdown items */
  color: var(--taupe); /* Item text color */
}

/* Change background color on hover */
.p-dropdown-item:hover {
  background-color: var(--light-taupe); /* Background color on hover */
}
</style>
