<template>
  <router-link to="/" class="image-container">
    <img src="../assets/logo/1.png" alt="L'Atelier de Marie">
  </router-link>
  <router-link to="/"><h1>L'Atelier de Marie</h1></router-link>
  <Burger class="burger" />
</template>

<script setup lang="ts">
import Burger from '../components/Burger.vue';
</script>

<style scoped>
img {
  width: 100%;
  height: 120%;
  object-fit: cover;
}
h1 {
  font-size: 2.5em;
  color: #a14b33;
  font-family: "Tangerine", cursive;
  font-weight: 700;
}

.image-container {
  width: 4em; /* Largeur du conteneur */
  height: 4em; /* Hauteur du conteneur */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}


</style>
