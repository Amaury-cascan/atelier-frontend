<template>
  <div class="page">
    <div class="auth-card">

      <div class="card-header">
        <p class="card-eyebrow">Sécurité</p>
        <h1 class="card-title">Nouveau mot de passe</h1>
      </div>

      <!-- Vérification en cours -->
      <div v-if="tokenState === 'verifying'" class="state-block">
        <i class="pi pi-spin pi-spinner state-icon"></i>
        <p class="state-label">Vérification du lien…</p>
      </div>

      <!-- Token invalide -->
      <div v-else-if="tokenState === 'invalid'" class="state-block">
        <div class="state-badge state-badge--error">
          <i class="pi pi-times-circle"></i>
        </div>
        <p class="state-title">Lien invalide</p>
        <p class="state-sub">{{ message }}</p>
        <router-link to="/forgot-password" class="btn-submit btn-submit--outline">
          Demander un nouveau lien
        </router-link>
      </div>

      <!-- Succès -->
      <div v-else-if="tokenState === 'success'" class="state-block">
        <div class="state-badge state-badge--ok">
          <i class="pi pi-check"></i>
        </div>
        <p class="state-title">Mot de passe modifié</p>
        <p class="state-sub">{{ message }}</p>
        <router-link to="/connexion" class="btn-submit">
          Se connecter
        </router-link>
      </div>

      <!-- Formulaire -->
      <form v-else-if="tokenState === 'valid'" @submit.prevent="handleSubmit" class="form-fields">
        <p class="card-desc">Choisissez un nouveau mot de passe pour votre compte.</p>

        <div class="field-group">
          <label class="field-label" for="pwd">Nouveau mot de passe</label>
          <div class="pwd-wrapper">
            <input
              id="pwd"
              :type="showPwd ? 'text' : 'password'"
              v-model="password"
              class="field-input"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button type="button" class="toggle-eye" @click="showPwd = !showPwd" tabindex="-1">
              <i :class="showPwd ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="confirm">Confirmer le mot de passe</label>
          <div class="pwd-wrapper">
            <input
              id="confirm"
              :type="showConfirm ? 'text' : 'password'"
              v-model="confirmPassword"
              class="field-input"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm" tabindex="-1">
              <i :class="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <p v-if="message" class="msg msg--error">{{ message }}</p>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">Modifier le mot de passe</span>
          <span v-else>Modification en cours…</span>
        </button>
      </form>

      <router-link to="/connexion" class="back-link">
        <i class="pi pi-arrow-left"></i> Retour à la connexion
      </router-link>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { verifyPasswordResetToken, confirmPasswordReset } from '@/services/api';

const route          = useRoute();
const token          = ref<string | null>(null);
const tokenState     = ref<'verifying' | 'valid' | 'invalid' | 'success'>('verifying');
const message        = ref('');
const loading        = ref(false);
const password       = ref('');
const confirmPassword = ref('');
const showPwd        = ref(false);
const showConfirm    = ref(false);

onMounted(async () => {
  const urlToken = route.query.token;
  if (typeof urlToken === 'string' && urlToken) {
    token.value = urlToken;
    try {
      await verifyPasswordResetToken(token.value);
      tokenState.value = 'valid';
    } catch {
      tokenState.value = 'invalid';
      message.value = 'Ce lien est invalide ou a expiré.';
    }
  } else {
    tokenState.value = 'invalid';
    message.value = 'Aucun lien de réinitialisation fourni.';
  }
});

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  loading.value = true;
  message.value = '';
  try {
    await confirmPasswordReset(token.value!, password.value);
    tokenState.value = 'success';
    message.value = 'Votre mot de passe a été réinitialisé avec succès.';
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.';
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
.card-header { text-align: center; margin-bottom: 24px; }
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
  margin-bottom: 20px;
}

/* Champs */
.form-fields { display: flex; flex-direction: column; gap: 14px; }
.field-group  { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.pwd-wrapper { position: relative; }
.field-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 0;
  padding: 11px 40px 11px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.88rem;
  color: var(--text-dark);
  background: var(--cream);
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}
.field-input:focus { border-color: var(--taupe); }
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
  transition: color 0.2s ease;
}
.toggle-eye:hover { color: var(--taupe); }

/* Message erreur */
.msg { font-size: 0.8rem; padding: 10px 14px; }
.msg--error {
  color: #c0392b;
  background: #fdf0f0;
  border: 1px solid #e8c0bc;
}

/* Bouton */
.btn-submit {
  display: block;
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
  text-align: center;
  text-decoration: none;
  transition: background-color 0.22s ease;
}
.btn-submit:hover:not(:disabled) { background: var(--taupe-dark); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit--outline {
  background: transparent;
  color: var(--taupe);
  border: 1px solid var(--border-strong);
}
.btn-submit--outline:hover { background: var(--blush); }

/* États (chargement / invalide / succès) */
.state-block {
  text-align: center;
  padding: 12px 0 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.state-icon { font-size: 1.8rem; color: var(--text-muted); }
.state-label { font-size: 0.84rem; color: var(--text-muted); }
.state-badge {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  font-size: 1.2rem;
}
.state-badge--error { color: #c0392b; border-color: #e8c0bc; }
.state-badge--ok    { color: var(--taupe); }
.state-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-dark);
}
.state-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 300px;
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
