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
                    if (error instanceof Error) {
                        this.error = error.message;
                    }
                } finally {
                    this.loading = false;
                }
            },
        },
    });
};
