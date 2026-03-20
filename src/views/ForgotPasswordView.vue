<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form">
      <h2>Mot de passe oublié ?</h2>
      <p>Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
        </button>
      </form>
      <div v-if="message" :class="isError ? 'error-message' : 'success-message'">
        {{ message }}
      </div>
      <router-link to="/connexion">Retour à la connexion</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { requestPasswordReset } from '@/services/api';

const email = ref('');
const loading = ref(false);
const message = ref('');
const isError = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    await requestPasswordReset(email.value);
    message.value = "Si un compte est associé à cette adresse, un email de réinitialisation a été envoyé. (veuillez vérifier vos spams)";
    isError.value = false;
  } catch (error: any) {
    isError.value = true;
    if (error.response && error.response.data && error.response.data.message) {
      message.value = error.response.data.message;
    } else {
      message.value = "Une erreur est survenue. Veuillez réessayer.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--beige);
}

.forgot-password-form {
  background: var(--beige);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  color: var(--taupe);
  margin-bottom: 1rem;
}

p {
    margin-bottom: 1.5rem;
    color: var(--taupe);
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
  background-color: #8B4513; /* Un ton taupe/marron */
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
}

button:hover:not(:disabled) {
  background-color: #A0522D;
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
    color: #8B4513;
    text-decoration: none;
}
</style> 