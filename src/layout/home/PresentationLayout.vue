<template>
  <div class="picture">
    <img src="../../assets/pictures/atelier.jpg" alt="Image de l'institut">
  </div>
  <div class="presentation">
    <div class="text-presentation">
      <h1>Bienvenue à L'Atelier de Marie</h1>
      <div class="text">
        <p>Votre nouveau salon de beauté au coeur de la Sologne.</p>
        <p>Ici, chaque cliente est traitée avec soin et attention.</p>
        <p>Entrez dans un univers chaleureux et cosy où votre beauté est notre priorité.</p>
        <a class="annonce" href="https://atelier-de-marie.com/prestation/9">Les Extensions de cils arrivent ! N'hésitez pas à me contacter pour plus d'informations.</a>
        <p>Marie à hâte de vous accueillir à l'Atelier</p>
        <p><a @click="redirectToLogin" class="info">Inscrivez-vous pour profiter de la possibilité de prendre des rendez-vous.</a></p>
      </div>
    </div>
    <div class="picture-full">
      <img src="../../assets/pictures/atelier.jpg" alt="Image de l'institut">
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
  display: flex;
  align-items: center;
  justify-content: center;

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
.picture-full{
  display: none;
}
.annonce{
  color: #6e1d0a;
  font-size: 2.5vh;
  text-align: justify !important;
}
@media (min-width: 500px) {
  .picture {
  display: none;
  }
  .picture-full{
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    height: 100%;
    padding: 1vh;
  }
  img {
    height: 100%;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  }

  .presentation {
    display: flex;
    justify-content: space-around;
    width: 90%;
    margin-inline: auto;
    height: 35vh;
  }
  .text{
    margin: 0;
  }
  h1{
    font-size: 2.5vw;
    text-align: start;
  }
  p {
    font-size: 1.1vw;
    text-align: start;
  }
  a {
    font-size: 0.9vw;
    text-align: start;
  }
  .text-presentation{
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>

