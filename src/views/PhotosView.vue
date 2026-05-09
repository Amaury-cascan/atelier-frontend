<template>
  <div class="gallery-page">

    <!-- ── En-tête ── -->
    <header class="gallery-header">
      <div class="header-deco"></div>
      <h1 class="header-title">Galerie</h1>
      <p class="header-sub">Découvrez nos réalisations et laissez-vous inspirer</p>
    </header>

    <!-- ── Skeleton ── -->
    <div v-if="isLoading" class="gallery-grid">
      <div v-for="n in 9" :key="n" class="photo-card skeleton-card"
        :style="{ animationDelay: `${n * 0.06}s` }"></div>
    </div>

    <!-- ── Grille masonry ── -->
    <div v-else class="gallery-grid">
      <div
        v-for="(p, index) in visiblePhotos"
        :key="p.id"
        class="photo-card"
        :style="{ animationDelay: `${(index % photosPerPage) * 0.055}s` }"
        @click="openLightbox(p)"
      >
        <img
          :src="'https://backoffice.atelier-de-marie.com/images/service/' + p.picture"
          :alt="p.description || 'Réalisation L\'Atelier de Marie'"
          loading="lazy"
        />
        <div class="photo-hover">
          <i class="pi pi-search-plus hover-icon"></i>
          <p v-if="p.description" class="hover-caption">{{ p.description }}</p>
        </div>
      </div>
    </div>

    <!-- ── Indicateur scroll infini ── -->
    <div v-if="loading" class="load-indicator">
      <span class="load-dot"></span>
      <span class="load-dot"></span>
      <span class="load-dot"></span>
    </div>

    <!-- ── Lightbox ── -->
    <Transition name="lb-fade">
      <div v-if="modalVisible" class="lightbox" @click.self="closeModal">

        <!-- Barre supérieure -->
        <div class="lb-bar">
          <span class="lb-brand">L'Atelier de Marie</span>
          <span class="lb-counter">{{ currentIndex + 1 }}&thinsp;/&thinsp;{{ visiblePhotos.length }}</span>
          <button class="lb-close" @click="closeModal" aria-label="Fermer">
            <span class="lb-close-line"></span>
            <span class="lb-close-line"></span>
          </button>
        </div>

        <!-- Contenu central -->
        <div class="lb-body" @click.self="closeModal">

          <!-- Flèche gauche -->
          <button class="lb-nav lb-prev" @click.stop="prevPhoto"
            :disabled="currentIndex === 0" aria-label="Précédent">
            <i class="pi pi-chevron-left"></i>
          </button>

          <!-- Image -->
          <div class="lb-stage" @click.stop>
            <Transition :name="slideDir" mode="out-in">
              <img
                :key="selectedPhoto?.id"
                class="lb-img"
                :src="'https://backoffice.atelier-de-marie.com/images/service/' + selectedPhoto?.picture"
                :alt="selectedPhoto?.description"
              />
            </Transition>
            <p v-if="selectedPhoto?.description" class="lb-caption">
              {{ selectedPhoto.description }}
            </p>
          </div>

          <!-- Flèche droite -->
          <button class="lb-nav lb-next" @click.stop="nextPhoto"
            :disabled="currentIndex === visiblePhotos.length - 1" aria-label="Suivant">
            <i class="pi pi-chevron-right"></i>
          </button>

        </div>

        <!-- Bande de miniatures -->
        <div class="lb-thumbs" ref="thumbsRef">
          <div
            v-for="(p, i) in visiblePhotos"
            :key="p.id"
            class="lb-thumb"
            :class="{ 'lb-thumb--active': i === currentIndex }"
            @click.stop="jumpTo(i)"
          >
            <img
              :src="'https://backoffice.atelier-de-marie.com/images/service/' + p.picture"
              :alt="p.description"
            />
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { usePhotoStore } from "@/stores/entityStore";

interface Photo {
  id: number;
  picture: string;
  description: string;
}

const photos        = ref<Photo[]>([]);
const visiblePhotos = ref<Photo[]>([]);
const photosPerPage = 9;
const currentPage   = ref(0);
const loading       = ref(false);
const isLoading     = ref(false);
const photoStore    = usePhotoStore();

// ── Lightbox ──
const modalVisible  = ref(false);
const selectedPhoto = ref<Photo | null>(null);
const currentIndex  = ref(0);
const thumbsRef     = ref<HTMLElement | null>(null);
const slideDir      = ref<'slide-left' | 'slide-right'>('slide-left');

const openLightbox = (photo: Photo) => {
  currentIndex.value  = visiblePhotos.value.findIndex((p) => p.id === photo.id);
  selectedPhoto.value = photo;
  modalVisible.value  = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  modalVisible.value  = false;
  selectedPhoto.value = null;
  document.body.style.overflow = '';
};

const prevPhoto = () => {
  if (currentIndex.value > 0) {
    slideDir.value = 'slide-right';
    currentIndex.value--;
    selectedPhoto.value = visiblePhotos.value[currentIndex.value];
  }
};

const nextPhoto = () => {
  if (currentIndex.value < visiblePhotos.value.length - 1) {
    slideDir.value = 'slide-left';
    currentIndex.value++;
    selectedPhoto.value = visiblePhotos.value[currentIndex.value];
  }
};

const jumpTo = (index: number) => {
  slideDir.value      = index > currentIndex.value ? 'slide-left' : 'slide-right';
  currentIndex.value  = index;
  selectedPhoto.value = visiblePhotos.value[index];
};

// Auto-scroll des miniatures vers la vignette active
watch(currentIndex, (newIdx) => {
  nextTick(() => {
    const container = thumbsRef.value;
    if (!container) return;
    const thumb = container.children[newIdx] as HTMLElement;
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
});

// Clavier
const handleKeydown = (e: KeyboardEvent) => {
  if (!modalVisible.value) return;
  if (e.key === 'Escape')      closeModal();
  if (e.key === 'ArrowLeft')   prevPhoto();
  if (e.key === 'ArrowRight')  nextPhoto();
};

// ── Chargement paginé ──
const loadPhotos = async () => {
  if (loading.value) return;
  loading.value = true;
  const start = currentPage.value * photosPerPage;
  const end   = start + photosPerPage;
  visiblePhotos.value.push(...photos.value.slice(start, end));
  currentPage.value++;
  loading.value = false;
};

const handleScroll = () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
  if (nearBottom && !loading.value && visiblePhotos.value.length < photos.value.length) {
    loadPhotos();
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const all: Photo[] = await photoStore.fetchEntities();
    photos.value = all.sort((a, b) => b.id - a.id);
    await loadPhotos();
    window.addEventListener('scroll',  handleScroll);
    window.addEventListener('keydown', handleKeydown);
  } catch (e) {
    console.error('Erreur chargement photos:', e);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll',  handleScroll);
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
.gallery-page {
  background-color: var(--cream);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* ─────────────────────────────────────────────
   En-tête
───────────────────────────────────────────── */
.gallery-header {
  text-align: center;
  padding: 64px 24px 52px;
  position: relative;
}

.header-deco {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, transparent, var(--taupe));
  margin: 0 auto 20px;
  opacity: 0.5;
}

.header-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--taupe);
  margin-bottom: 10px;
}

.header-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 300;
  color: var(--text-dark);
  letter-spacing: 0.1em;
  margin-bottom: 14px;
  line-height: 1;
}

.header-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
  letter-spacing: 0.05em;
}

/* ─────────────────────────────────────────────
   Grille masonry
───────────────────────────────────────────── */
.gallery-grid {
  columns: 2;
  column-gap: 6px;
  width: 94%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 6px;
}

/* ── Card photo ── */
.photo-card {
  break-inside: avoid;
  margin-bottom: 6px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: block;
  background-color: var(--blush);
  /* Entrance animation */
  animation: card-in 0.55s ease both;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

.photo-card img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Hover */
.photo-hover {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(44, 36, 34, 0.82) 0%,
    rgba(44, 36, 34, 0.2) 45%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 18px 14px;
  opacity: 0;
  transition: opacity 0.32s ease;
}

.hover-icon {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 6px;
  transform: translateY(8px);
  transition: transform 0.32s ease;
}

.hover-caption {
  color: white;
  font-size: 0.74rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-align: center;
  line-height: 1.4;
  transform: translateY(8px);
  transition: transform 0.32s ease 0.04s;
}

.photo-card:hover img { transform: scale(1.06); }
.photo-card:hover .photo-hover { opacity: 1; }
.photo-card:hover .hover-icon,
.photo-card:hover .hover-caption { transform: translateY(0); }

/* ── Skeleton ── */
.skeleton-card {
  height: 220px;
  background: linear-gradient(90deg, var(--blush) 25%, #ede0dd 50%, var(--blush) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite !important;
}
.skeleton-card:nth-child(3n) { height: 280px; }
.skeleton-card:nth-child(5n) { height: 170px; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Loader ── */
.load-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
}
.load-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--taupe);
  opacity: 0.4;
  animation: pulse-dot 1.2s ease-in-out infinite;
}
.load-dot:nth-child(2) { animation-delay: 0.2s; }
.load-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse-dot {
  0%, 80%, 100% { opacity: 0.4; transform: scale(1); }
  40%           { opacity: 1;   transform: scale(1.35); }
}

/* ─────────────────────────────────────────────
   Lightbox – galerie éditoriale claire
───────────────────────────────────────────── */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(253, 248, 246, 0.97); /* cream givré */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

/* ── Barre supérieure ── */
.lb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.lb-brand {
  font-family: 'Tangerine', cursive;
  font-size: 1.6rem;
  color: var(--taupe);
  letter-spacing: 0.02em;
  line-height: 1;
}

.lb-counter {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.lb-close {
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.lb-close-line {
  position: absolute;
  width: 18px;
  height: 1.5px;
  background: var(--text-dark);
  transition: background-color 0.2s ease;
}
.lb-close-line:first-child { transform: rotate(45deg); }
.lb-close-line:last-child  { transform: rotate(-45deg); }
.lb-close:hover .lb-close-line { background: var(--taupe); }

/* ── Corps central ── */
.lb-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 0;
  padding: 0;
}

/* ── Flèches ── */
.lb-nav {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--border-strong);
  width: 56px;
  height: 100%;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s ease, background-color 0.18s ease;
  align-self: stretch;
}
.lb-nav:hover:not(:disabled) {
  color: var(--taupe);
  background: rgba(174, 120, 112, 0.04);
}
.lb-nav:disabled { opacity: 0.18; cursor: not-allowed; }

/* ── Image ── */
.lb-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 24px 0 18px;
}

.lb-img {
  max-width: 100%;
  max-height: 68vh;
  object-fit: contain;
  display: block;
  box-shadow: var(--shadow-lg);
}

.lb-caption {
  margin-top: 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.74rem;
  font-style: italic;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-align: center;
}

/* ── Bande miniatures ── */
.lb-thumbs {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 12px 56px 14px;
  border-top: 1px solid var(--border-color);
  scrollbar-width: none;
  background: var(--white);
}
.lb-thumbs::-webkit-scrollbar { display: none; }

.lb-thumb {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.35;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: opacity 0.2s ease, outline-color 0.2s ease, transform 0.2s ease;
}
.lb-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.lb-thumb:hover { opacity: 0.7; transform: translateY(-2px); }
.lb-thumb--active {
  opacity: 1;
  outline-color: var(--taupe);
  transform: translateY(-3px);
}

/* ─────────────────────────────────────────────
   Transitions lightbox
───────────────────────────────────────────── */
.lb-fade-enter-active, .lb-fade-leave-active { transition: opacity 0.28s ease; }
.lb-fade-enter-from, .lb-fade-leave-to { opacity: 0; }

/* Slide gauche → droite */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.slide-left-enter-from  { opacity: 0; transform: translateX(24px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-24px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-24px); }
.slide-right-leave-to   { opacity: 0; transform: translateX(24px); }

/* ─────────────────────────────────────────────
   Responsive
───────────────────────────────────────────── */
@media (max-width: 639px) {
  .lb-nav { width: 36px; font-size: 0.75rem; }
  .lb-img { max-height: 52vh; }
  .lb-thumb { width: 40px; height: 40px; }
  .lb-thumbs { padding: 10px 16px 12px; }
  .lb-brand { font-size: 1.3rem; }
}

@media (min-width: 640px) {
  .gallery-grid { columns: 3; column-gap: 8px; }
  .photo-card { margin-bottom: 8px; }
}

@media (min-width: 1024px) {
  .gallery-grid { columns: 4; column-gap: 10px; }
  .photo-card { margin-bottom: 10px; }
  .lb-nav { width: 72px; }
  .lb-img { max-height: 70vh; }
  .lb-thumb { width: 58px; height: 58px; }
}
</style>
