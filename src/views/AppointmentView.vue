<template>
  <div class="appointments-container">
    <DataTable :value="userAppointments" responsiveLayout="scroll" class="p-datatable-sm">
      <Column field="date" header="Date" :body="formatDateColumn"></Column>
      <Column field="service" header="Prestation"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// Variable réactive pour stocker les rendez-vous
const appointments = ref([]);

// Récupérer l'objet `user` depuis le localStorage et en extraire l'id
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

// Fonction pour récupérer les rendez-vous existants via l'API
const fetchAppointments = async () => {
  try {
    const response = await axios.get(`https://backoffice.atelier-de-marie.com/api/appointment/list`);
    appointments.value = response.data.appointments;
    console.log(appointments.value);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous :", error);
  }
};

// Créez une liste réactive des rendez-vous de l'utilisateur
const userAppointments = computed(() =>
    appointments.value.filter(appointment => appointment.user === userId)
);

// Fonction pour formater la date au format DD/MM/YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Fonction pour formater la colonne de date dans le DataTable
const formatDateColumn = (rowData) => {
  return formatDate(rowData.date);
};

// Appel de la fonction une fois le composant monté
onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.appointments-container {
  padding: 10px;
  max-width: 600px;
  margin: 0 auto;
}


</style>
