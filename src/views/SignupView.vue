<template>
  <div class="container">
    <h1>Inscription</h1>
    <div class="input-wrapper">
      <InputText class="input" v-model="nameValue" placeholder="Nom" />
    </div>
    <div class="input-wrapper">
      <InputText class="input" v-model="firstNameValue" placeholder="Prénom" />
    </div>
    <div class="input-wrapper">
      <InputText class="input" v-model="emailValue" placeholder="Email" />
    </div>
    <div class="input-wrapper">
      <InputText class="input" v-model="phoneNumberValue" placeholder="Numéro de téléphone" />
    </div>
    <div class="input-wrapper">
      <Password class="input" v-model="passwordValue" placeholder="Mot de passe" :feedback="false" />
    </div>
    <div class="input-wrapper">
      <Password class="input" v-model="confirmPasswordValue" placeholder="Confirmer le mot de passe" :feedback="false" />
    </div>
    <div class="button-wrapper">
      <Button class="button" label="Créer un compte" @click="register" :disabled="loading" />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p>Déjà un compte ? <a @click="redirectToLogin">Connectez-vous</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Champs réactifs pour le formulaire de création de compte
const nameValue = ref('');               // Pour le nom
const firstNameValue = ref('');          // Pour le prénom
const emailValue = ref('');               // Pour l'email
const passwordValue = ref('');            // Pour le mot de passe
const phoneNumberValue = ref('');         // Pour le numéro de téléphone
const confirmPasswordValue = ref('');     // Pour la confirmation du mot de passe
const loading = ref(false);
const error = ref('');

// Fonction de redirection vers la page de connexion
const redirectToLogin = () => {
  router.push({ name: 'connexion' });
};

// Fonction d'inscription
const register = async () => {
  loading.value = true;
  error.value = '';

  // Vérification que les mots de passe correspondent
  if (passwordValue.value !== confirmPasswordValue.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    loading.value = false;
    return;
  }

  // Vérification que l'email est valide
  if (!/\S+@\S+\.\S+/.test(emailValue.value)) {
    error.value = 'Veuillez entrer un email valide.';
    loading.value = false;
    return;
  }

  try {
    await authStore.signup({
      name: nameValue.value,
      firstName: firstNameValue.value,
      email: emailValue.value,
      password: passwordValue.value,
      phoneNumber: phoneNumberValue.value,
    });
    await authStore.signin({ username: emailValue.value, password: passwordValue.value });
    const storedRoute = localStorage.getItem('desiredRoute');
    if (storedRoute) {
      // Redirige vers la page d'accueil
      const desiredRoute = JSON.parse(storedRoute); // Récupérez et parsez la route
      router.push(desiredRoute); // Redirigez vers la route désirée
      localStorage.removeItem('desiredRoute'); // Supprimez la route de localStorage après utilisation
    } else {
      window.location.href = '/';
     }
  } catch (err) {
    error.value = 'Erreur lors de la création du compte. Veuillez réessayer.';
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
</style>
