<template>
  <div class="container">
  <PresentationLayout />
  <div class="card">
    <Carousel
        :value="serviceStore.services"
        :numVisible="1"
        :numScroll="1"
        :responsiveOptions="responsiveOptions"
        circular
        :autoplayInterval="3000"
    >
      <template #item="slotProps">
        <div class="service-item">
          <div class="service-image-container">
            <img
                :src="'https://127.0.0.1:8000/images/service/' + slotProps.data.picture"
                alt="Service image"
                class="service-image"
            />
            <span class="category-badge">{{ slotProps.data.category }}</span>
          </div>
          <div class="service-details">
            <h3 class="service-name">{{ slotProps.data.name }}</h3>
            <Button class="reserve-button">Prendre Rendez-vous</Button>
          </div>
        </div>
      </template>
    </Carousel>
  </div>
  </div>
</template>

<script setup lang="ts">
import PresentationLayout from "@/layout/home/PresentationLayout.vue";
import Button from "primevue/button";
import Carousel from "primevue/carousel";
import { useServiceStore } from "@/stores/entityStore"; // Importez votre store

const serviceStore = useServiceStore(); // Instanciez le store pour les services
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


serviceStore.fetchEntities();



</script>

<style scoped>
.card {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.service-item {
  height: 240px;
  border-radius: 10px;
  margin-inline: 5px;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  background: rgba(245, 223, 198, 0.82);
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.service-item:hover {
  transform: scale(1.1);
}

.service-image-container {
  position: relative;
  width: 100%;
  height: 20vh;
  overflow: hidden;
}

.service-image {
  width: 100%;
  object-fit: cover;
}
img {
  height: 100%;
  width: 100%;
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
  padding-bottom: 0;
}

.service-name {
  font-size: 2.5em;
  color: var(--taupe);
  margin-bottom: 2px;
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
  width: 90%;
}

@media (max-width: 600px) {
  .service-item {

  }

  .service-name {
    font-size: 1.2em;
  }

}
@media (min-width: 500px) {
  .container{
    width: 75%;
    margin: 0 auto;
  }
}
</style>
