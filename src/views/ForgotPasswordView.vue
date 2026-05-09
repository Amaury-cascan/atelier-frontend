<template>
  <div class="page">
    <div class="auth-card">

      <div class="card-header">
        <p class="card-eyebrow">Sécurité</p>
        <h1 class="card-title">Mot de passe oublié</h1>
      </div>

      <!-- Formulaire -->
      <template v-if="!sent">
        <p class="card-desc">
          Renseignez votre adresse e-mail. Si un compte lui est associé, vous recevrez un lien de réinitialisation.
        </p>

        <form @submit.prevent="handleSubmit" class="form-fields">
          <div class="field-group">
            <label class="field-label" for="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              v-model="email"
              class="field-input"
              placeholder="votre@email.com"
              required
              autocomplete="email"
            />
          </div>

          <p v-if="isError" class="msg msg--error">{{ message }}</p>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Envoyer le lien</span>
            <span v-else>Envoi en cours…</span>
          </button>
        </form>
      </template>

      <!-- Succès -->
      <div v-else class="success-state">
        <div class="success-icon"><i class="pi pi-envelope"></i></div>
        <p class="success-title">E-mail envoyé</p>
        <p class="success-sub">{{ message }}</p>
      </div>

      <router-link to="/connexion" class="back-link">
        <i class="pi pi-arrow-left"></i> Retour à la connexion
      </router-link>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { requestPasswordReset } from '@/services/api';

const email   = ref('');
const loading = ref(false);
const message = ref('');
const isError = ref(false);
const sent    = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;
  try {
    await requestPasswordReset(email.value);
    message.value = 'Si un compte est associé à cette adresse, un e-mail de réinitialisation a été envoyé. Vérifiez vos courriers indésirables.';
    sent.value = true;
  } catch (error: any) {
    isError.value = true;
    message.value = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: var(--cream);
}

.auth-card {
  background: var(--white);
  border: 1px solid var(--border-color);
  padding: 36px 24px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Header */
.card-header { text-align: center; margin-bottom: 20px; }
.card-eyebrow {
  font-family: 'Tangerine', cursive;
  font-size: 2rem;
  color: var(--taupe);
  line-height: 1;
  margin-bottom: -4px;
}
.card-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.04em;
}

.card-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.7;
  text-align: center;
  margin-bottom: 24px;
}

/* Champs */
.form-fields { display: flex; flex-direction: column; gap: 16px; }
.field-group  { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.field-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 0;
  padding: 11px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.88rem;
  color: var(--text-dark);
  background: var(--cream);
  outline: none;
  transition: border-color 0.2s ease;
}
.field-input:focus { border-color: var(--taupe); }

/* Messages */
.msg { font-size: 0.8rem; padding: 10px 14px; margin-top: 4px; }
.msg--error {
  color: #c0392b;
  background: #fdf0f0;
  border: 1px solid #e8c0bc;
}

/* Bouton */
.btn-submit {
  width: 100%;
  background: var(--taupe);
  color: white;
  border: none;
  padding: 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.22s ease;
}
.btn-submit:hover:not(:disabled) { background: var(--taupe-dark); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Succès */
.success-state {
  text-align: center;
  padding: 16px 0 24px;
}
.success-icon {
  width: 52px;
  height: 52px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--taupe);
  font-size: 1.2rem;
}
.success-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-dark);
  margin-bottom: 10px;
}
.success-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.7;
}

/* Lien retour */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}
.back-link:hover { color: var(--taupe); }
.back-link .pi { font-size: 0.66rem; }

@media (min-width: 480px) {
  .auth-card { padding: 48px 40px 40px; }
}
</style>
