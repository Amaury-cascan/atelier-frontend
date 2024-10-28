<template>
  <div class="picture">
    <img src="../../assets/pictures/soin-ongles.jpg" alt="Image des ongles">
  </div>
  <div class="presentation">
    <h1>Soin des Ongles</h1>
    <p>Offrez à vos ongles une attention particulière avec notre service de soin des ongles. En tant que professionnel dédié, je mets tout en œuvre pour vous offrir une expérience de beauté personnalisée dans un cadre confortable et raffiné.</p>
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
  margin: 0.5em;
  color: var(--taupe);
}
</style>

