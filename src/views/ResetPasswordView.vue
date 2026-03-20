<template>
  <div class="reset-password-container">
    <div class="reset-password-form">
      <h1>Réinitialiser votre mot de passe</h1>

      <div v-if="tokenState === 'verifying'">
        <p>Vérification du lien en cours...</p>
      </div>

      <div v-else-if="tokenState === 'invalid'">
        <p class="error-message">{{ message }}</p>
        <router-link to="/forgot-password">Demander un nouveau lien</router-link>
      </div>

      <div v-else-if="tokenState === 'success'">
         <p class="success-message">{{ message }}</p>
         <router-link to="/connexion">Aller à la page de connexion</router-link>
      </div>

      <form v-else-if="tokenState === 'valid'" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmation du mot de passe</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Modification en cours...' : 'Modifier le mot de passe' }}
        </button>
        <div v-if="message" class="error-message">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { verifyPasswordResetToken, confirmPasswordReset } from '@/services/api';

const route = useRoute();

const token = ref<string | null>(null);
const tokenState = ref<'verifying' | 'valid' | 'invalid' | 'success'>('verifying'); // 'verifying', 'valid', 'invalid', 'success'
const message = ref('');
const loading = ref(false);

const password = ref('');
const confirmPassword = ref('');

onMounted(async () => {
  const urlToken = route.query.token;
  if (typeof urlToken === 'string' && urlToken) {
    token.value = urlToken;
    try {
      await verifyPasswordResetToken(token.value);
      tokenState.value = 'valid';
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      tokenState.value = 'invalid';
      message.value = 'Ce lien est invalide ou a expiré.';
    }
  } else {
    tokenState.value = 'invalid';
    message.value = 'Aucun token de réinitialisation fourni.';
  }
});

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  loading.value = true;
  message.value = '';

  if (token.value) {
    try {
      await confirmPasswordReset(token.value, password.value);
      tokenState.value = 'success';
      message.value = 'Votre mot de passe a été réinitialisé avec succès.';
    } catch (error: any) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.value = error.response.data.message;
      } else {
        message.value = "Une erreur est survenue lors de la réinitialisation.";
      }
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--beige);
}

.reset-password-form {
  background: var(--beige);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h1 {
  color: var(--taupe);
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--taupe);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--taupe);
  border-radius: 4px;
  background-color: var(--beige);
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: var(--taupe);
  color: var(--beige);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: var(--taupe);
}

button:hover:not(:disabled) {
  background-color: var(--taupe);
}

.success-message {
  margin-top: 1rem;
  color: green;
}

.error-message {
  margin-top: 1rem;
  color: red;
}

a {
    display: block;
    margin-top: 1.5rem;
    color: var(--taupe);
    text-decoration: none;
}
</style> 