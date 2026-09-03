import { defineStore } from 'pinia';
import axiosInstance from '@/services/api';
import axios from 'axios';
import { API_BASE } from '@/utils/auth';

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
                const response = await axios.post(`${API_BASE}signup`, user);
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
            try {
                const response = await axios.post(`${API_BASE}login_check`, credentials);

                this.token = response.data.token;
                localStorage.setItem('token', this.token!);

                const userResponse = await axios.get(`${API_BASE}me`, {
                    headers: { Authorization: `Bearer ${this.token}` },
                });

                const user: AuthUser = {
                    id: userResponse.data.id,
                    name: userResponse.data.name,
                    firstName: userResponse.data.firstName,
                    email: userResponse.data.email,
                    roles: Array.isArray(userResponse.data.roles) ? userResponse.data.roles : [],
                };

                localStorage.setItem('user', JSON.stringify(user));
                this.user = user;
                return true;
            } catch (error: any) {
                this.error = 'Identifiants incorrects ou problème d\'authentification.';
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
                const response = await axios.post(`${API_BASE}forgot-password`, { email });
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
                const response = await axios.patch(`${API_BASE}reset-password/${token}`, userData);
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
                await axios.get(`${API_BASE}verify/${token}`);
            } catch (err) {
                this.error = 'Erreur lors de la vérification de l\'email.';
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
