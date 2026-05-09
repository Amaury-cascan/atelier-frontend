<template>
  <div class="app-wrapper">
    <header class="site-header">
      <Navigation/>
    </header>
    <main class="site-main">
      <router-view/>
    </main>
    <footer class="site-footer">
      <FooterLayout/>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navigation from "./layout/Navigation.vue";
import FooterLayout from "@/layout/FooterLayout.vue";
import { onMounted, onUnmounted } from "vue";

let intervalId: number | null = null;

const checkStorageExpiry = () => {
  const expiryTime = localStorage.getItem("expiryTime");
  if (expiryTime && Date.now() > Number(expiryTime)) {
    localStorage.clear();
    window.location.href = window.location.href;
  }
};

onMounted(() => {
  checkStorageExpiry();
  intervalId = setInterval(checkStorageExpiry, 10 * 60 * 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--cream);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: rgba(253, 250, 248, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 1px 0 rgba(166, 124, 136, 0.12),
    0 4px 24px rgba(44, 36, 34, 0.05);
  width: 100%;
}

.site-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.site-footer {
  margin-top: auto;
}
</style>
