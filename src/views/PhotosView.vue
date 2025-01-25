<template>
  <h1>Galerie de photos</h1>
  <div class="content-container">
    <div
        v-for="p in visiblePhotos"
        :key="p.id"
        class="img-container"
        @click="showImage(p)"
    >
      <img
          :src="'https://backoffice.atelier-de-marie.com/images/service/' + p.picture"
          :alt="p.description"
      />
      <p>{{ p.description }}</p>
    </div>

    <!-- Affiche un message de chargement si plus de photos doivent être récupérées -->
    <div v-if="loading" class="loading">
      Chargement...
    </div>

    <!-- Modal pour afficher l'image en plein écran -->
    <div v-if="modalVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img
            :src="'https://backoffice.atelier-de-marie.com/images/service/' + selectedPhoto?.picture"
            :alt="selectedPhoto?.description"
        />
        <p>{{ selectedPhoto?.description }}</p>
        <button class="close-button" @click="closeModal">X</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { usePhotoStore } from "@/stores/entityStore";

// Déclarez l'interface Photo pour le typage
interface Photo {
  id: number;
  picture: string;
  description: string;
}

const photos = ref<Photo[]>([]); // Liste des photos initiales
const visiblePhotos = ref<Photo[]>([]); // Photos visibles
const photosPerPage = 4; // Nombre de photos chargées par lot
const currentPage = ref(0); // Page actuelle pour le chargement
const loading = ref(false); // État de chargement

const photoStore = usePhotoStore(); // Instanciation du store

// État pour le modal et la photo sélectionnée
const modalVisible = ref(false);
const selectedPhoto = ref<Photo | null>(null);

// Fonction pour afficher le modal avec la photo sélectionnée
const showImage = (photo: Photo) => {
  selectedPhoto.value = photo;
  modalVisible.value = true;
};

// Fonction pour fermer le modal
const closeModal = () => {
  modalVisible.value = false;
  selectedPhoto.value = null;
};

// Charge les photos pour la page actuelle
const loadPhotos = async () => {
  if (loading.value) return; // Empêche les appels multiples
  loading.value = true;

  // Calcule les indices des photos à charger
  const start = currentPage.value * photosPerPage;
  const end = start + photosPerPage;

  // Ajoute les nouvelles photos à la liste visible
  visiblePhotos.value.push(...photos.value.slice(start, end));

  currentPage.value++;
  loading.value = false;
};

// Gère le défilement pour charger plus de photos
const handleScroll = () => {
  const bottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;

  if (bottom) {
    loadPhotos();
  }
};

// Initialisation des photos et de l'écoute du défilement
onMounted(async () => {
  photos.value = await photoStore.fetchEntities(); // Récupère toutes les photos
  loadPhotos(); // Charge le premier lot de photos

  window.addEventListener("scroll", handleScroll);
});

// Nettoyage
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>

h1{
  text-align: center;
  margin: 0.5em;
  margin-inline: 2em;
  color: var(--taupe);
}
.content-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
}
.img-container {
  margin: 0.5vh 0;
  position: relative;
  width: 48%;
  height: 36vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(0, 0, 0);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  border-radius: 5px;
  cursor: pointer;
}
.img-container img {
  width: 100%;
  object-fit: contain;
}
.img-container p {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px;
  text-align: center;
}

.loading {
  width: 100%;
  text-align: center;
  font-size: 1.2em;
  color: gray;
  margin-top: 20px;
}

/* Style pour le modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  text-align: center;
  background: rgb(245, 223, 198);
  padding: 10px;
  border-radius: 10px;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  margin-bottom: 10px;
}

.modal-content p {
  margin-top: 10px;
  font-size: 1.2em;
  color: var(--taupe);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background-color: var(--taupe);
  color: white;
  padding: 5px 10px;
  border-radius: 25px;
  cursor: pointer;
}
</style>


