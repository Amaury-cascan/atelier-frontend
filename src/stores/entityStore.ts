
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

export const usePhotoStore = createGenericStore(
    'photoStore',
    'photos',
    'picture-presentation/'
)
