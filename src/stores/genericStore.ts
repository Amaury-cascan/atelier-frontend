// src/stores/genericEntityStore.ts

import { defineStore } from 'pinia';
import axiosInstance from '@/services/api';  // L'instance Axios configurée

export const createGenericStore = (storeName: string, entityName: string, apiUrl: string) => {
    return defineStore(storeName, {
        state: () => ({
            [entityName]: [] as any[],  // Liste générique basée sur l'entité (ex: conditionFinancieres ou contactCategories)
            loading: false,
            error: null as string | null,
        }),

        actions: {
            // Récupération des entités
            async fetchEntities() {
                this.loading = true;
                try {
                    const response = await axiosInstance.get(apiUrl);
                    if (Array.isArray(response.data)) {
                        this[entityName] = response.data; // Mettre à jour la liste d'entités
                    } else {
                        this[entityName] = [];
                    }
                    return response.data;
                } catch (error) {
                    console.error(`Erreur lors de la récupération des ${entityName}`, error);
                    this.error = error;
                } finally {
                    this.loading = false;
                }
            },

            // Ajout d'une nouvelle entité
            async addEntity(newEntity: { nom: string }) {
                this.loading = true;
                try {
                    const response = await axiosInstance.post(apiUrl, newEntity);
                    this[entityName].push(response.data);  // Ajouter l'entité localement
                } catch (error) {
                    console.error(`Erreur lors de l'ajout d'une entité dans ${entityName}`, error);
                    this.error = error;
                } finally {
                    this.loading = false;
                }
            },

            // Mise à jour d'une entité existante
            async updateEntity(id: number, updatedEntity: { nom: string }) {
                this.loading = true;
                try {
                    const response = await axiosInstance.patch(`${apiUrl}${id}`, updatedEntity);
                    const index = this[entityName].findIndex((entity: any) => entity.id === id);
                    if (index !== -1) {
                        this[entityName][index] = response.data;
                    }
                } catch (error) {
                    console.error(`Erreur lors de la mise à jour d'une entité dans ${entityName}`, error);
                    this.error = error;
                } finally {
                    this.loading = false;
                }
            },

            // Suppression d'une entité
            async deleteEntity(id: number) {
                this.loading = true;
                try {
                    await axiosInstance.delete(`${apiUrl}${id}`);
                    this[entityName] = this[entityName].filter((entity: any) => entity.id !== id);
                } catch (error) {
                    console.error(`Erreur lors de la suppression d'une entité dans ${entityName}`, error);
                    this.error = error;
                } finally {
                    this.loading = false;
                }
            },
        },
    });
};
