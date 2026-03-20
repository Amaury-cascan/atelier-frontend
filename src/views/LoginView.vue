<template>
  <div class="container">
    <h1>Connexion</h1>
    <div class="input-wrapper">
      <InputText class="input" v-model="emailValue" placeholder="Email" />
    </div>
    <div class="input-wrapper">
      <Password class="input"  v-model="passwordValue" placeholder="Mot de passe" :feedback="false"/>
    </div>
    <div class="button-wrapper">
      <Button class="button" label="Connexion" @click="login" :disabled="loading" />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p><router-link to="/forgot-password">Mot de passe oublié ?</router-link></p>
    <p>Pas encore de compte ? <a @click="redirectToLogin">Inscrivez-vous</a></p>
    <p class="info">Inscrivez-vous pour profiter de la possibilité de prendre des rendez-vous.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRouter } from "vue-router";


// Déclaration des variables réactives pour l'email et le mot de passe
const emailValue = ref('');
const passwordValue = ref('');

const authStore = useAuthStore();
const router = useRouter();


const redirectToLogin = () => {
  router.push({ name: 'inscription' });
};
// Variables réactives pour l'état du chargement et les erreurs
const loading = ref(false);
const error = ref('');
// Fonction de connexion déclenchée au clic sur le bouton
const login = async () => {
  loading.value = true;
  error.value = '';

  try {
    // Connexion avec le store auth
    await authStore.signin({
      username: emailValue.value,
      password: passwordValue.value
    });

    // Créer l'expiryTime à la connexion (30 minutes)
    const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes en millisecondes
    localStorage.setItem("expiryTime", (Date.now() + EXPIRY_TIME).toString());

    // Vérifier si une route désirée est stockée
    const storedRoute = localStorage.getItem('desiredRoute');
    if (storedRoute) {
      const desiredRoute = JSON.parse(storedRoute);
      router.push(desiredRoute);
      localStorage.removeItem('desiredRoute');
    } else {
      window.location.href = '/'; // Rediriger vers la page d'accueil
    }

  } catch (err) {
    error.value = 'Erreur de connexion. Veuillez vérifier vos identifiants.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  margin-top: 4vh;
  color: var(--taupe);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
  margin-inline: auto;
}

.subtext {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 400;
}

.input-wrapper {
  margin: 4px 0;
  width: 90%;
  text-align: center;
  border: solid 1px var(--taupe);
  border-radius: 10px;
  padding: 0.5em;
}

.button-wrapper {
  margin-top: 16px;
  background-color: var(--taupe);
  border-radius: 10px;
  padding: 0.5em;
  color: var(--beige);
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}
.input {
  width: 100%;
  background-color: var(--beige);
}
a {
  color: var(--taupe);
  text-decoration: underline;
  cursor: pointer;
}
.info {
  font-style: italic;
  font-size: 1vh;
}
</style>
