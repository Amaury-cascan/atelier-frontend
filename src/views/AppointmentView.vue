<template>
  <h2>Mes Rendez-vous</h2>
  <div class="appointments-container">
    <DataTable :value="userAppointments" responsiveLayout="scroll" class="p-datatable-sm">
      <Column :field="formatDateColumn" header="Date" ></Column>
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
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous :", error);
  }
};

// Créez une liste réactive des rendez-vous de l'utilisateur
const userAppointments = computed(() =>
    appointments.value
        .filter(appointment => appointment.user === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
);

// Fonction pour formater la colonne de date dans le DataTable
const formatDateColumn = (rowData) => {
  const date = new Date(rowData.date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} à ${hours}:${minutes}`;
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
h2{
  color: var(--taupe);
  text-align: center;
  margin : 10px 0;
}
</style>
