<template>
  <div class="page">
    <div class="auth-card">

      <div class="card-header">
        <p class="card-eyebrow">Bienvenue</p>
        <h1 class="card-title">Créer un compte</h1>
      </div>

      <form @submit.prevent="register" class="form-fields">

        <!-- Nom / Prénom côte à côte -->
        <div class="field-row">
          <div class="field-group">
            <label class="field-label" for="nom">Nom</label>
            <input id="nom" type="text" class="field-input" v-model="nameValue" placeholder="Dupont" required autocomplete="family-name" />
          </div>
          <div class="field-group">
            <label class="field-label" for="prenom">Prénom</label>
            <input id="prenom" type="text" class="field-input" v-model="firstNameValue" placeholder="Marie" required autocomplete="given-name" />
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label" for="email">Adresse e-mail</label>
          <input id="email" type="email" class="field-input" v-model="emailValue" placeholder="votre@email.com" required autocomplete="email" />
        </div>

        <!-- Téléphone -->
        <div class="field-group">
          <label class="field-label" for="tel">Téléphone</label>
          <input id="tel" type="tel" class="field-input" v-model="phoneNumberValue" placeholder="06 00 00 00 00" autocomplete="tel" />
        </div>

        <!-- Mot de passe -->
        <div class="field-group">
          <label class="field-label" for="pwd">Mot de passe</label>
          <div class="pwd-wrapper">
            <input
              id="pwd"
              :type="showPwd ? 'text' : 'password'"
              v-model="passwordValue"
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

        <!-- Confirmer mot de passe -->
        <div class="field-group">
          <label class="field-label" for="confirm">Confirmer le mot de passe</label>
          <div class="pwd-wrapper">
            <input
              id="confirm"
              :type="showConfirm ? 'text' : 'password'"
              v-model="confirmPasswordValue"
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

        <label class="consent">
          <input type="checkbox" v-model="privacyAccepted" />
          <span>
            J'ai lu et j'accepte les
            <router-link to="/mentions-legales" target="_blank">mentions légales</router-link>
            et la
            <router-link to="/politique-de-confidentialite" target="_blank">politique de confidentialité</router-link>.
          </span>
        </label>

        <p v-if="error" class="msg msg--error">{{ error }}</p>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">Créer mon compte</span>
          <span v-else>Création en cours…</span>
        </button>

      </form>

      <div class="card-links">
        <span class="links-text">Déjà un compte ?</span>
        <router-link to="/connexion" class="text-link">Se connecter</router-link>
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
import { useRouter } from 'vue-router';

const router   = useRouter();
const authStore = useAuthStore();

const nameValue           = ref('');
const firstNameValue      = ref('');
const emailValue          = ref('');
const phoneNumberValue    = ref('');
const passwordValue       = ref('');
const confirmPasswordValue = ref('');
const privacyAccepted = ref(false);
const loading  = ref(false);
const error    = ref('');
const showPwd  = ref(false);
const showConfirm = ref(false);

const register = async () => {
  error.value = '';

  if (passwordValue.value !== confirmPasswordValue.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  if (!/\S+@\S+\.\S+/.test(emailValue.value)) {
    error.value = 'Veuillez entrer un e-mail valide.';
    return;
  }
  if (!privacyAccepted.value) {
    error.value = 'Vous devez accepter les mentions légales et la politique de confidentialité pour créer un compte.';
    return;
  }

  loading.value = true;
  try {
    await authStore.signup({
      name: nameValue.value,
      firstName: firstNameValue.value,
      email: emailValue.value,
      password: passwordValue.value,
      phoneNumber: phoneNumberValue.value,
      privacyPolicyAccepted: true,
    });
    await authStore.signin({ username: emailValue.value, password: passwordValue.value });
    const storedRoute = localStorage.getItem('desiredRoute');
    if (storedRoute) {
      router.push(JSON.parse(storedRoute));
      localStorage.removeItem('desiredRoute');
    } else {
      window.location.href = '/';
    }
  } catch {
    error.value = 'Erreur lors de la création du compte. Veuillez réessayer.';
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

/* ── Carte ── */
.auth-card {
  background: var(--white);
  border: 1px solid var(--border-color);
  padding: 36px 24px 32px;
  max-width: 460px;
  width: 100%;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── En-tête ── */
.card-header { text-align: center; margin-bottom: 28px; }
.card-eyebrow {
  font-family: 'Tangerine', cursive;
  font-size: 2.2rem;
  color: var(--taupe);
  line-height: 1;
  margin-bottom: -6px;
}
.card-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.2rem;
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.04em;
}

/* ── Champs ── */
.form-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-group { display: flex; flex-direction: column; gap: 6px; }
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
  box-sizing: border-box;
}
.field-input:focus { border-color: var(--taupe); }

/* Mot de passe avec œil */
.pwd-wrapper { position: relative; }
.pwd-wrapper .field-input { padding-right: 40px; }
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

.consent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--text-muted);
  cursor: pointer;
}
.consent input {
  margin-top: 3px;
  flex-shrink: 0;
  accent-color: var(--taupe);
}
.consent a {
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.consent a:hover { color: var(--taupe-dark); }

/* ── Erreur ── */
.msg { font-size: 0.8rem; padding: 10px 14px; }
.msg--error {
  color: #c0392b;
  background: #fdf0f0;
  border: 1px solid #e8c0bc;
}

/* ── Bouton principal ── */
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
  margin-top: 6px;
  transition: background-color 0.22s ease;
}
.btn-submit:hover:not(:disabled) { background: var(--taupe-dark); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Liens ── */
.card-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
}
.links-text {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.text-link {
  font-size: 0.78rem;
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.text-link:hover { color: var(--taupe-dark); }

/* ── Note ── */
.info-note {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--text-muted);
  text-align: center;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  line-height: 1.6;
}

/* ── Responsive ── */
@media (min-width: 480px) {
  .auth-card { padding: 48px 40px 40px; }
}

@media (max-width: 360px) {
  .field-row { grid-template-columns: 1fr; }
}
</style>
