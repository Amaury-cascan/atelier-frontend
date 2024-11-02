import { defineStore } from 'pinia';
import axiosInstance from '@/services/api';
import axios from 'axios';


export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any | null,
        role: localStorage.getItem('user_role') || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async signup(user: any) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('https://backoffice.atelier-de-marie.com/api/signup', user);
                this.user = response.data.user;
                return response;
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    // Gestion des erreurs spécifiques à Axios
                    if (error.response) {
                        this.error = `Erreur ${error.response.status}: ${error.response.data.message || 'Une erreur est survenue.'}`;

                    } else if (error.request) {
                        // La requête a été faite mais aucune réponse n'a été reçue
                        this.error = 'Pas de réponse du serveur. Vérifiez votre connexion Internet.';
                    } else {
                        // Quelque chose s'est mal passé lors de la configuration de la requête
                        this.error = 'Erreur lors de la configuration de la requête.';
                    }
                } else {
                    // Erreur non spécifique à Axios
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
                const response = await axios.post(`https://backoffice.atelier-de-marie.com/api/login_check`, credentials, { withCredentials: true });

                this.token = response.data.token;
                localStorage.setItem('token', this.token);

                // Récupération des détails de l'utilisateur avec le token JWT
                const userResponse = await axios.get(`https://backoffice.atelier-de-marie.com/api/me`, {
                    headers: { Authorization: `Bearer ${this.token}` }
                });

                const user = {
                    id: userResponse.data.id,
                    name: userResponse.data.name,
                    firstName: userResponse.data.firstName,
                    email: userResponse.data.email,
                    roles: userResponse.data.roles,
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
            // Réinitialiser les états de l'application
            this.user = null;
            this.token = null;

            // Effacer complètement le localStorage
            localStorage.clear();

            // Supprimer l'en-tête d'autorisation d'axios
            delete axiosInstance.defaults.headers.common['Authorization'];

        },

        // Fonction pour envoyer une demande de réinitialisation de mot de passe
        async forgotPassword(email: string) {
            try {
                const response = await axios.post(`https://backoffice.atelier-de-marie.com/api/forgot-password`, { email });
                t
                return response.data;
            } catch (err) {
                // Vérifier si la réponse correspond à l'erreur 'unknown_user'
                if (err.response && err.response.data && err.response.data.code === 'unknown_user') {
                    this.error = "L'email n'existe pas.";
                } else {
                    this.error = 'Erreur lors de la demande de réinitialisation du mot de passe.';
                }
                return null;
            } finally {
                this.loading = false;
            }
        },

        // Fonction pour réinitialiser le mot de passe
        async resetPassword(token: string, userData: { password: string, passwordConfirmation: string }){
            try {
                const response = await axios.patch(`https://backoffice.atelier-de-marie.com/api/reset-password/${token}`, userData );
               return response.data;
            } catch (err) {
                 this.error = 'Erreur lors de la réinitialisation du mot de passe.';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async verifyEmail (token: string) {
            try {
                await axios.get(`https://backoffice.atelier-de-marie.com/api/verify/${token}`);
            } catch (err) {
                this.error = 'Erreur lors de la vérification de l\'email.';
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async getUserData() {
            try {
                const response = await axios.get('https://backoffice.atelier-de-marie.com/api/me', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });

                const { id, role } = response.data;
                this.user = response.data;
                this.role = role;

                // Mettre à jour le localStorage également si nécessaire
                localStorage.setItem('user_id', id.toString());
                localStorage.setItem('user_role', role);
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur', error);
                throw error;
            }
        },

        isAuthenticated() {
            return !!this.token;
        },
    },
});
