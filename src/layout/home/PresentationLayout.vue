<template>
  <div class="picture">
    <img src="../../assets/pictures/institut.jpg" alt="Image de l'institut">
  </div>
  <div class="presentation">
    <h1>Bienvenue</h1>
    <h1>à L'Atelier de Marie</h1>
    <p>Votre nouvelle prothésiste ongulaire au coeur de la Sologne.</p>
    <p>Ici, chaque cliente est traitée avec soin et attention.</p>
    <p>Entrez dans un univers chaleureux et cosy où votre beauté est notre priorité.</p>
    <p>Marie à hâte de vous accueillir à l'Atelier</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.picture {
  border-bottom: 2px solid var(--taupe);
  overflow: hidden;
  height: 37vh;
}
img {
  width: 100%;
  height: auto;
  object-fit: cover;

}
.presentation {
  border-bottom: 2px solid var(--taupe);
  margin-bottom: 25px;
}
h1,p {
  text-align: center;
  color: var(--taupe);
  margin-bottom: 0.2rem;
}

@media (min-width: 500px) {
  .picture {
    width: 50%;
    margin: 0 auto;
  }
  .presentation {
    width: 50%;
    margin-inline: auto;
    border-bottom: 2px solid var(--taupe);
    margin-bottom: 25px;
  }
}
</style>

