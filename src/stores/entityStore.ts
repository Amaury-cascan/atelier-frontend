
import { createGenericStore } from '@/stores/genericStore'

// Store pour les conditions financières
export const useCategoryStore = createGenericStore(
    'categoryStore',
    'categories',
    'categories/'
);
export const useServiceStore = createGenericStore(
    'serviceStore',
    'services',
    'services/'
)
