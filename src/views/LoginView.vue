<template>
  <div class="container">
    <h3>Nouveau sur l'appli ?</h3>
    <h3 class="subtext">Vous avez déjà un compte ?</h3>
    <h3 class="subtext">Identifiez-vous</h3>
    <div class="input-wrapper">
      <InputText v-model="emailValue" placeholder="Email" />
    </div>
    <div class="input-wrapper">
      <Password v-model="passwordValue" placeholder="Mot de passe" :feedback="false"/>
    </div>
    <div class="button-wrapper">
      <Button class="button" label="Connexion" @click="login" :disabled="loading" />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
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

// Variables réactives pour l'état du chargement et les erreurs
const loading = ref(false);
const error = ref('');
// Fonction de connexion déclenchée au clic sur le bouton
const login = async () => {
  loading.value = true;
  error.value = '';

  try {
    // Appel de la fonction signin du store pour se connecter
    await authStore.signin({
      username: emailValue.value,
      password: passwordValue.value
    });
    await router.push({ name: 'home' });
  } catch (err) {
    // Gérer les erreurs
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
}

.subtext {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 400;
}

.input-wrapper {
  margin: 4px 0;
  width: 70%;
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
</style>
