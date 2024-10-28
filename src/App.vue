
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
</script>


<style scoped>
  .container-app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  header {
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2px solid var(--taupe);
  }

  @media (min-width: 500px) {
    header {
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 2px solid var(--taupe);
    }
    .container-app {
      width: 70%;
      margin: 0 auto;
      background-color: var(--beige);
      box-shadow: 10px 0 5px gray, -10px 0 5px gray;
    }
  }
</style>
