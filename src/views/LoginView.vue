<template>
  <div class="page">
    <div class="login-card">
      <div class="card-header">
        <p class="card-eyebrow">Bienvenue</p>
        <h1 class="card-title">Connexion</h1>
      </div>

      <div class="form-fields">
        <div class="field-group">
          <label class="field-label">Adresse e-mail</label>
          <InputText
            class="field-input"
            v-model="emailValue"
            placeholder="votre@email.com"
            type="email"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Mot de passe</label>
          <div class="pwd-wrapper">
            <Password
              v-model="passwordValue"
              placeholder="••••••••"
              :feedback="false"
              :toggleMask="true"
            />
          </div>
        </div>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button class="btn-submit" @click="login" :disabled="loading">
        <span v-if="!loading">Se connecter</span>
        <span v-else>Connexion…</span>
      </button>

      <div class="card-links">
        <router-link to="/forgot-password" class="text-link">Mot de passe oublié ?</router-link>
        <span class="links-sep">·</span>
        <a class="text-link" @click="redirectToSignup">Créer un compte</a>
      </div>

      <p class="info-note">
        Un compte est nécessaire pour réserver vos prestations en ligne.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import { useRouter } from "vue-router";

const emailValue = ref('');
const passwordValue = ref('');
const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');

const redirectToSignup = () => {
  router.push({ name: 'inscription' });
};

const login = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.signin({
      username: emailValue.value,
      password: passwordValue.value,
    });
    const EXPIRY_TIME = 30 * 60 * 1000;
    localStorage.setItem("expiryTime", (Date.now() + EXPIRY_TIME).toString());
    const storedRoute = localStorage.getItem('desiredRoute');
    if (storedRoute) {
      router.push(JSON.parse(storedRoute));
      localStorage.removeItem('desiredRoute');
    } else {
      window.location.href = '/';
    }
  } catch {
    error.value = 'Identifiants incorrects. Veuillez réessayer.';
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
  background-color: var(--cream);
}

/* ─────────────────────────────────────────────
   Carte
───────────────────────────────────────────── */
.login-card {
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 36px 24px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0;
}

@media (min-width: 480px) {
  .login-card { padding: 48px 40px 40px; }
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-eyebrow {
  font-family: 'Tangerine', cursive;
  font-size: 2.2rem;
  color: var(--taupe);
  margin-bottom: -6px;
  line-height: 1;
}

.card-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.04em;
}

/* ─────────────────────────────────────────────
   Champs
───────────────────────────────────────────── */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* InputText (email) */
.field-input {
  width: 100% !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  padding: 11px 14px !important;
  font-family: 'Montserrat', sans-serif !important;
  font-size: 0.88rem !important;
  color: var(--text-dark) !important;
  background: var(--cream) !important;
  outline: none !important;
  transition: border-color 0.2s ease !important;
  box-shadow: none !important;
}

.field-input:focus {
  border-color: var(--taupe) !important;
  box-shadow: none !important;
}

/* Password — ciblage des internaux PrimeVue */
.pwd-wrapper {
  width: 100%;
}

.pwd-wrapper :deep(.p-password) {
  width: 100%;
  display: block;
}

.pwd-wrapper :deep(.p-password-input) {
  width: 100% !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  padding: 11px 40px 11px 14px !important;
  font-family: 'Montserrat', sans-serif !important;
  font-size: 0.88rem !important;
  color: var(--text-dark) !important;
  background: var(--cream) !important;
  outline: none !important;
  box-shadow: none !important;
  transition: border-color 0.2s ease !important;
}

.pwd-wrapper :deep(.p-password-input:focus) {
  border-color: var(--taupe) !important;
  box-shadow: none !important;
}

.pwd-wrapper :deep(.p-password-mask-icon),
.pwd-wrapper :deep(.p-password-unmask-icon) {
  color: var(--text-muted);
  right: 12px;
  font-size: 0.88rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pwd-wrapper :deep(.p-password-mask-icon:hover),
.pwd-wrapper :deep(.p-password-unmask-icon:hover) {
  color: var(--taupe);
}

/* ─────────────────────────────────────────────
   Bouton
───────────────────────────────────────────── */
.btn-submit {
  width: 100%;
  background: var(--taupe);
  color: white;
  border: none;
  padding: 14px 24px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  margin-top: 4px;
  margin-bottom: 20px;
  transition: background-color 0.25s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--taupe-dark);
}

.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ─────────────────────────────────────────────
   Liens
───────────────────────────────────────────── */
.card-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.text-link {
  font-size: 0.78rem;
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.text-link:hover {
  color: var(--taupe-dark);
}

.links-sep {
  color: var(--border-strong);
  font-size: 0.8rem;
}

/* ─────────────────────────────────────────────
   Note & erreur
───────────────────────────────────────────── */
.info-note {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--text-muted);
  text-align: center;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  line-height: 1.6;
}

.error-msg {
  font-size: 0.8rem;
  color: #c0392b;
  text-align: center;
  background: #fdf0f0;
  border: 1px solid #e8c0bc;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: 0;
}
</style>
