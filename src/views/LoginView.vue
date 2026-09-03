<template>
  <div class="page">
    <div class="login-card">
      <div class="card-header">
        <p class="card-eyebrow">Bienvenue</p>
        <h1 class="card-title">Connexion</h1>
      </div>

      <form @submit.prevent="login" class="form-fields">
        <div class="field-group">
          <label class="field-label" for="email">Adresse e-mail</label>
          <input
            id="email"
            v-model="emailValue"
            class="field-input"
            type="email"
            inputmode="email"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="username"
            placeholder="votre@email.com"
            required
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="password">Mot de passe</label>
          <div class="pwd-wrapper">
            <input
              id="password"
              v-model="passwordValue"
              class="field-input"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            />
            <button type="button" class="toggle-eye" @click="showPwd = !showPwd" tabindex="-1" aria-label="Afficher le mot de passe">
              <i :class="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">Se connecter</span>
          <span v-else>Connexion…</span>
        </button>
      </form>

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
import { useRouter } from "vue-router";
import { normalizeEmail, normalizePassword } from '@/utils/auth';

const emailValue = ref('');
const passwordValue = ref('');
const showPwd = ref(false);
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

  const username = normalizeEmail(emailValue.value);
  const password = normalizePassword(passwordValue.value);

  if (!username || !password) {
    error.value = 'Veuillez renseigner votre e-mail et votre mot de passe.';
    loading.value = false;
    return;
  }

  try {
    await authStore.signin({ username, password });
    localStorage.setItem("expiryTime", (Date.now() + 30 * 60 * 1000).toString());
    const storedRoute = localStorage.getItem('desiredRoute');
    if (storedRoute) {
      router.push(JSON.parse(storedRoute));
      localStorage.removeItem('desiredRoute');
    } else {
      window.location.href = '/';
    }
  } catch {
    error.value = authStore.error || 'Une erreur est survenue. Veuillez réessayer.';
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

.field-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 0;
  padding: 11px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  color: var(--text-dark);
  background: var(--cream);
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.field-input:focus {
  border-color: var(--taupe);
}

.pwd-wrapper {
  position: relative;
  width: 100%;
}

.pwd-wrapper .field-input {
  padding-right: 40px;
}

.toggle-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.88rem;
}

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
  transition: background-color 0.25s ease;
}

.btn-submit:hover:not(:disabled) { background: var(--taupe-dark); }
.btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

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
}

.links-sep {
  color: var(--border-strong);
  font-size: 0.8rem;
}

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
  border-radius: 0;
}
</style>
