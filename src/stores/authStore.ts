import { defineStore } from 'pinia';
import axiosInstance from '@/services/api';
import axios from 'axios';
import {
  buildUserFromToken,
  clearStaleAuth,
  normalizeEmail,
  normalizePassword,
} from '@/utils/auth';

export type AuthUser = {
  id: number;
  name: string;
  firstName: string;
  email: string;
  roles: string[];
};

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      id: Number(parsed.id ?? 0),
      name: String(parsed.name ?? ''),
      firstName: String(parsed.firstName ?? ''),
      email: String(parsed.email ?? ''),
      roles: Array.isArray(parsed.roles) ? parsed.roles.map(String) : [],
    };
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser() as AuthUser | null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    roles: (state): string[] => state.user?.roles ?? [],
    isAdmin(): boolean {
      return this.roles.includes('ROLE_ADMIN');
    },
    displayName: (state): string => {
      if (!state.user) return '';
      return [state.user.firstName, state.user.name].filter(Boolean).join(' ') || state.user.email;
    },
  },

  actions: {
    hydrateFromStorage() {
      this.token = localStorage.getItem('token');
      this.user = readStoredUser();
    },

    async signup(user: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(
          'https://backoffice.atelier-de-marie.com/api/signup',
          user,
          { withCredentials: true },
        );
        this.user = response.data.user;
        return response;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            this.error = `Erreur ${error.response.status}: ${error.response.data.message || 'Une erreur est survenue.'}`;
          } else if (error.request) {
            this.error = 'Pas de réponse du serveur. Vérifiez votre connexion Internet.';
          } else {
            this.error = 'Erreur lors de la configuration de la requête.';
          }
        } else {
          this.error = 'Erreur inconnue.';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signin(credentials: { username: string; password: string }) {
      this.loading = true;
      this.error = null;

      const username = normalizeEmail(credentials.username);
      const password = normalizePassword(credentials.password);

      if (!username || !password) {
        this.error = 'Veuillez renseigner votre e-mail et votre mot de passe.';
        this.loading = false;
        throw new Error('MISSING_CREDENTIALS');
      }

      try {
        clearStaleAuth();
        this.token = null;
        this.user = null;

        let loginResponse;
        try {
          loginResponse = await axiosInstance.post('login_check', {
            username,
            password,
          });
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            if (!error.response) {
              this.error = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
            } else if (error.response.status === 401) {
              this.error = 'Identifiants incorrects.';
            } else {
              this.error = `Erreur ${error.response.status} lors de la connexion.`;
            }
          } else {
            this.error = 'Une erreur est survenue lors de la connexion.';
          }
          throw error;
        }

        this.token = loginResponse.data.token;
        localStorage.setItem('token', this.token || '');

        let user: AuthUser;
        try {
          const userResponse = await axiosInstance.get('me');
          user = {
            id: userResponse.data.id,
            name: userResponse.data.name,
            firstName: userResponse.data.firstName,
            email: userResponse.data.email,
            roles: Array.isArray(userResponse.data.roles) ? userResponse.data.roles : [],
          };
        } catch {
          // login_check OK mais /me bloqué → repli JWT
          user = buildUserFromToken(this.token!, username);
        }

        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
        return true;
      } catch (error: unknown) {
        if (!this.error) {
          this.error = 'Une erreur est survenue lors de la connexion.';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signout() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiryTime');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      delete axiosInstance.defaults.headers.common['Authorization'];
    },

    async forgotPassword(email: string) {
      try {
        const response = await axios.post(
          'https://backoffice.atelier-de-marie.com/api/forgot-password',
          { email },
          { withCredentials: true },
        );
        return response.data;
      } catch (err: any) {
        if (err.response?.data?.code === 'unknown_user') {
          this.error = "L'email n'existe pas.";
        } else {
          this.error = 'Erreur lors de la demande de réinitialisation du mot de passe.';
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(token: string, userData: { password: string; passwordConfirmation: string }) {
      try {
        const response = await axios.patch(
          `https://backoffice.atelier-de-marie.com/api/reset-password/${token}`,
          userData,
          { withCredentials: true },
        );
        return response.data;
      } catch {
        this.error = 'Erreur lors de la réinitialisation du mot de passe.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async verifyEmail(token: string) {
      try {
        await axios.get(`https://backoffice.atelier-de-marie.com/api/verify/${token}`, {
          withCredentials: true,
        });
      } catch (err) {
        this.error = "Erreur lors de la vérification de l'email.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
