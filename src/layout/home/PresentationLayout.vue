<template>
  <div class="picture">
    <img src="../../assets/pictures/atelier.png" alt="Image de l'institut">
  </div>
  <div class="presentation">
    <h1>Bienvenue à L'Atelier de Marie</h1>
    <div class="text">
      <p>Votre nouvelle prothésiste ongulaire au coeur de la Sologne.</p>
      <p>Ici, chaque cliente est traitée avec soin et attention.</p>
      <p>Entrez dans un univers chaleureux et cosy où votre beauté est notre priorité.</p>
      <p>Marie à hâte de vous accueillir à l'Atelier</p>
      <p><a @click="redirectToLogin" class="info">Inscrivez-vous pour profiter de la possibilité de prendre des rendez-vous.</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter} from "vue-router";

const router = useRouter();

const redirectToLogin = () => {
  router.push({ name: 'inscription' });
};
</script>

<style scoped>
.picture {
  border-bottom: 2px solid var(--taupe);
  overflow: hidden;
  height: 35vh;
  display: flex; /* Ajout de cette ligne */
  align-items: center; /* Centrer verticalement */
  justify-content: center; /* Centrer horizontalement */
}

img {
  object-fit: contain; /* Modifiez ici */
  min-width: 100%; /* Ajoutez cette ligne pour empêcher l'étirement */

}
.presentation {
  border-bottom: 2px solid var(--taupe);
  margin-bottom: 25px;
}
h1,p{
  text-align: center;
  color: var(--taupe);
  margin-bottom: 0.2rem;

}
.text {
  width: 90%;
  margin: 0 auto;
}
a {
  color: var(--taupe);
  text-decoration: underline;
  cursor: pointer;
  font-style: oblique;
  font-size: 1.1vh;
  text-align: center;
}
</style>

