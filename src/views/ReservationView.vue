<template>
  <div class="reservation-container">
    <h1>Réservation</h1>
    <div v-if="service" class="infos-div">
      <div class="content-div">
        <div class="picture">
          <img :src="'https://backoffice.atelier-de-marie.com/images/service/' + service.picture" alt="Service image" />
        </div>
        <div class="text">
          <h2>{{ service.name }}</h2>
          <p>{{ service.description }}</p>
          <p><strong>Durée : </strong>{{ service.duration }} min</p>
          <p><strong>Tarif : </strong>{{ service.price }}€</p>
        </div>
      </div>
        <div class="form-group">
          <label for="date">Choisissez une date :</label>
          <DatePicker
              id="date"
              v-model="reservation.date"
              :showIcon="true"
              :disabledDays="[0,1]"
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

// Importation des composants PrimeVue
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';


const route = useRoute();
const router = useRouter();
const serviceStore = useServiceStore();
const service = ref(null);
const reservation = ref({
  date: null,
  time: ''
});


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
  const interval = 30; // Intervalle de 30 minutes
  let times = [];
  const now = new Date();

  const selectedDate = reservation.value.date;
  if (!selectedDate) return;

  const selectedDateLocal = new Date(selectedDate.getTime() - now.getTimezoneOffset() * 60000);
  const dayOfWeek = selectedDateLocal.getUTCDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const serviceDuration = service.value.duration; // Durée du service en minutes

  // Filtrer les rendez-vous pour la date sélectionnée
  const selectedDateString = selectedDateLocal.toISOString().split('T')[0];
  const appointmentsForSelectedDate = appointments.value.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toISOString().split('T')[0] === selectedDateString;
  });

  // Génération des créneaux horaires
  for (let hour = startHour; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date(selectedDateLocal);
      time.setHours(hour, minute, 0, 0);
      const endTime = new Date(time.getTime() + serviceDuration * 60000);
      // Appliquer les restrictions spécifiques aux jours
      if (
          // Mardi, mercredi, jeudi :
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && (endTime.getHours() === 17 && endTime.getMinutes() > 0))
          ||
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && (endTime.getHours() === 18 && endTime.getMinutes() >= 0))
          ||
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && (endTime.getHours() > 20))
          ||
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && (endTime.getHours() === 20 && endTime.getMinutes() > 0))
          ||
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && time.getHours() === 17)
          ||
          ((dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) && (time.getHours() === 18 && time.getMinutes() === 0))
          ||
          // Vendredi : exclure les créneaux dont la fin dépasse 20h
          (dayOfWeek === 5 && (endTime.getHours() > 20 || (endTime.getHours() === 20 && endTime.getMinutes() > 0)))
          ||
          // Samedi : exclure les créneaux dont la fin dépasse 15h
          (dayOfWeek === 6 && (endTime.getHours() > 15 || (endTime.getHours() === 15 && endTime.getMinutes() > 0)))
      ) {
        continue; // Exclure ce créneau s'il ne respecte pas les restrictions
      }

      // Vérifiez que l'heure n'est pas dans le passé
      if (time > now) {
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSlotTaken = isTimeSlotTaken(timeString, appointmentsForSelectedDate);

        if (!isSlotTaken) {
          times.push({ label: timeString, value: timeString });
        }
      }
      if (times.length === 0) {
        times.push({ label: 'Plus de rendez-vous disponibles', value: null, disabled: true });
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

.styled-datepicker {
  width: 100%;
  font-size: 1.1em;
  color: var(--taupe);
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--taupe);
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

label {
  color: var(--taupe);
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
  color: var(--taupe);
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--taupe);
}

.styled-select:focus {
  outline: none;
  border-color: var(--taupe);
}

@media (min-width: 500px) {
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
