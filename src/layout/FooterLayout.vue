<template>
  <div class="footer">
    <div class="coordonees">
      <div class="picture">
        <img src="../assets/logo/1.png" alt="Logo">
      </div>
      <h3>L'Atelier de Marie</h3>
      <h4>06.60.53.50.44</h4>
      <p>latelierdemarie41@outlook.com</p>
      <div>
        <p>19 Rue Georges Genevier</p>
        <p>41300 Salbris</p>
      </div>
      <div class="icons">
        <a target="_blank" href="https://www.facebook.com/people/LAtelier-de-Marie/61567138575765/"><i class="pi pi-facebook"></i></a>
        <a target="_blank" href="https://www.instagram.com/accounts/login/?next=https%3A%2F%2Fwww.instagram.com%2Flatelierdemarie41%2F%3Figsh%3DYnB3dXYwbnVuNTJn&is_from_rle"><i class="pi pi-instagram"></i></a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
img {
  width: 20%;
  object-fit: cover;
  margin-inline: auto;
}
.footer {
  border-top: 2px solid var(--taupe);
  margin-top: 25px;
}
h4,h3 ,p {
  text-align: center;
  margin: 0.5em;
  color: var(--taupe);
  line-height: 0.6em;
}
.picture {
  display: flex;
  align-items: center;
}
.icons {
  display: flex;
  justify-content: center;
  gap: 1em;
  color: var(--taupe);
  font-size: 1.5em;
}
@media (min-width: 500px) {
  .footer {
    width: 90%;
    margin-inline: auto;
    display: flex;
  }
  .coordonees{
    display: flex;
    width: 100%;
    justify-content: center;
    gap: 2vw;
    align-items: center;
  }
  .footer {
    width: 90%;
  }
  .picture {
    width: fit-content;
    align-items: start;
  }
  img {
    width: 3vw;
  }
  h3{
    font-size: 1.4vw;
  }
  h4{
    font-size: 1.1vw;
  }
  P{
    font-size: 1.1vw;
  }
}
</style>

