
<template>
  <div class="container-app">
    <header>
      <Navigation/>
    </header>
    <main>
      <router-view/>
    </main>
    <footer>
      <FooterLayout/>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navigation from "./layout/Navigation.vue";
import FooterLayout from "@/layout/FooterLayout.vue";
import { onMounted, onUnmounted } from "vue";

let intervalId: number | null = null;

// Vérifie si le `localStorage` a expiré
const checkStorageExpiry = () => {
  const expiryTime = localStorage.getItem("expiryTime");
  if (expiryTime && Date.now() > Number(expiryTime)) {
    localStorage.clear();
    window.location.href = window.location.href;
  }
};


onMounted(() => {
  checkStorageExpiry();
  intervalId = setInterval(checkStorageExpiry, 10 * 60 *  1000); // Vérifie toutes les 10 min
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>


<style scoped>
  .container-app {
    min-width: 100vw;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  header {
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2px solid var(--taupe);
    margin-inline: auto;
    width: 100%;
  }

  @media (min-width: 760px) {
    .container-app {
      width: 100vw;
      margin: 0 auto;
      background-color: var(--beige);
    }
    header{
      width: 90%;
    }
  }
</style>
