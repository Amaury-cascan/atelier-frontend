<template>
  <div class="home">

    <!-- ────────── Hero ────────── -->
    <PresentationLayout />

    <!-- ────────── Ticker animé ────────── -->
    <div class="ticker-wrapper" aria-hidden="true">
      <div class="ticker-track">
        <span v-for="n in 3" :key="n" class="ticker-group">
          <span class="ticker-item">Onglerie</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Manucure</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Pose de gel</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Nail Art</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Pédicure</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Extensions</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Semi-permanent</span>
          <span class="ticker-dot">✦</span>
          <span class="ticker-item">Soins &amp; Beauté</span>
          <span class="ticker-dot">✦</span>
        </span>
      </div>
    </div>

    <!-- ────────── Aperçu galerie (bento éditorial) ────────── -->
    <section class="gallery-preview">
      <div class="gallery-preview-header">
        <div>
          <p class="section-eyebrow">Inspirations</p>
          <h2 class="section-title">Nos dernières créations</h2>
        </div>
        <button @click="goToGallery" class="preview-cta">
          Voir toute la galerie <i class="pi pi-arrow-right"></i>
        </button>
      </div>

      <!-- Skeleton pendant chargement -->
      <div v-if="photosLoading" class="bento-grid bento-skeleton">
        <div v-for="n in 5" :key="n" class="bento-cell skeleton-cell" :class="`bento-cell--${n-1}`"></div>
      </div>

      <!-- Bento éditorial -->
      <div v-else class="bento-grid">
        <div
          v-for="(photo, i) in previewPhotos"
          :key="photo.id"
          class="bento-cell"
          :class="`bento-cell--${i}`"
          @click="goToGallery"
        >
          <img
            :src="'https://backoffice.atelier-de-marie.com/images/service/' + photo.picture"
            :alt="photo.description || 'Réalisation L\'Atelier de Marie'"
            loading="lazy"
          />
          <div class="bento-overlay">
            <i class="pi pi-search-plus"></i>
          </div>
        </div>
      </div>

      <!-- CTA mobile -->
      <div class="preview-cta-wrap-mobile">
        <button @click="goToGallery" class="preview-cta">
          Voir toute la galerie <i class="pi pi-arrow-right"></i>
        </button>
      </div>
    </section>

    <!-- ────────── Citation ────────── -->
    <div class="quote-section">
      <div class="quote-line"></div>
      <blockquote class="quote-text">
        « Ici, chaque cliente est unique,<br>
        <em>chaque soin, un moment rien que pour soi.</em> »
      </blockquote>
      <p class="quote-author">— Marie</p>
      <div class="quote-line"></div>
    </div>

    <!-- ══════════════════════════════════════════
         SECTION BOOKING (ancre cible du hero CTA)
    ══════════════════════════════════════════ -->
    <section id="booking" class="booking-section" v-if="!isLoaded">
      <div class="booking-inner">

        <!-- ── Colonne gauche : prestations ── -->
        <div class="services-col">
          <div class="section-header">
            <p class="section-eyebrow">Réserver</p>
            <h2 class="section-title">Nos prestations</h2>
          </div>

          <!-- Onglets catégories -->
          <div class="cat-tabs" role="tablist">
            <button
              class="cat-tab"
              :class="{ active: activeCategory === 'Toutes' }"
              @click="activeCategory = 'Toutes'"
              role="tab"
            >Toutes</button>
            <button
              v-for="cat in categories"
              :key="cat.name"
              class="cat-tab"
              :class="{ active: activeCategory === cat.name }"
              @click="activeCategory = cat.name"
              role="tab"
            >{{ cat.name }}</button>
          </div>

          <!-- Menu spa de prestations -->
          <Transition name="fade-list" mode="out-in">
            <div :key="activeCategory" class="services-menu">
              <div
                v-for="service in filteredServices"
                :key="service.id"
                class="menu-item"
                @click="handleAppointment(service)"
              >
                <div class="menu-item-info">
                  <h3 class="menu-item-name">{{ service.name }}</h3>
                  <span class="menu-item-duration">{{ service.duration }} min</span>
                </div>
                <div class="menu-item-right">
                  <span class="menu-item-price">{{ service.price }}&nbsp;€</span>
                  <button class="menu-item-btn" @click.stop="handleAppointment(service)">
                    Réserver
                  </button>
                </div>
              </div>

              <p v-if="filteredServices.length === 0" class="no-services">
                Aucune prestation disponible dans cette catégorie.
              </p>
            </div>
          </Transition>
        </div>

        <!-- ── Colonne droite : horaires ── -->
        <div class="hours-col">
          <div class="section-header">
            <p class="section-eyebrow">Nous trouver</p>
            <h2 class="section-title">Horaires</h2>
          </div>

          <!-- Badge statut aujourd'hui -->
          <div class="today-status" :class="todayStatusClass">
            <div class="today-dot"></div>
            <div class="today-info">
              <p class="today-label">{{ todayBadgeLabel }}</p>
              <p class="today-hours">{{ todayEntry.display }}</p>
            </div>
          </div>

          <!-- Liste des horaires -->
          <div class="hours-list">
            <div
              v-for="entry in SCHEDULE"
              :key="entry.day"
              class="hours-row"
              :class="{ 'hours-row--today': entry.isToday }"
            >
              <span class="hours-day">
                <span v-if="entry.isToday" class="today-marker">▸</span>
                {{ entry.day }}
              </span>
              <span
                class="hours-time"
                :class="{
                  'hours-time--closed':  !entry.hours,
                  'hours-time--special': entry.special,
                }"
              >{{ entry.display }}</span>
            </div>
          </div>

          <!-- Adresse -->
          <div class="address-card">
            <i class="pi pi-map-marker address-icon"></i>
            <div>
              <p class="address-street">19 Rue Georges Genevier</p>
              <p class="address-city">41300 Salbris</p>
              <a
                href="https://maps.google.com/?q=19+Rue+Georges+Genevier+41300+Salbris"
                target="_blank"
                rel="noopener"
                class="address-link"
              >Voir sur Google Maps →</a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Dialog authentification -->
    <Dialog
      v-model:visible="authDialogVisible"
      :modal="true"
      :closable="true"
      header="Connexion requise"
      @hide="clearAuthDialog"
      class="custom-dialog"
    >
      <p class="dialog-text">
        Connectez-vous ou créez un compte pour réserver une prestation.
      </p>
      <div class="dialog-actions">
        <button @click="redirectToLogin" class="btn-dialog">Se connecter</button>
        <button @click="redirectToSignup" class="btn-dialog btn-dialog--outline">S'inscrire</button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import PresentationLayout from "@/layout/home/PresentationLayout.vue";
import { useCategoryStore, useServiceStore, usePhotoStore } from "@/stores/entityStore";
import { useRouter } from 'vue-router';
import Dialog from "primevue/dialog";
import { ref, computed, onMounted } from "vue";

const router = useRouter();

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  picture: string;
  category: string;
  active?: boolean;
}

interface Categorie {
  name: string;
}

interface Photo {
  id: number;
  picture: string;
  description: string;
}

// ── Services / catégories ──
const authDialogVisible = ref(false);
const serviceStore    = useServiceStore();
const categorieStore  = useCategoryStore();
const isLoaded        = ref(true);
const services        = ref<Service[]>([]);
const categories      = ref<Categorie[]>([]);
const activeCategory  = ref('Toutes');

const filteredServices = computed(() =>
  activeCategory.value === 'Toutes'
    ? services.value
    : services.value.filter((s) => s.category === activeCategory.value)
);

// ── Photos aperçu ──
const photoStore    = usePhotoStore();
const previewPhotos = ref<Photo[]>([]);
const photosLoading = ref(true);

const shuffled = (arr: Photo[]) => [...arr].sort(() => Math.random() - 0.5);
const goToGallery = () => router.push({ name: 'photos' });

// ── Horaires ──
const RAW_SCHEDULE = [
  { day: 'Dimanche', jsDay: 0, hours: null,                   special: false },
  { day: 'Lundi',    jsDay: 1, hours: '09h30 – 16h00 · 18h30 – 20h00', special: false },
  { day: 'Mardi',    jsDay: 2, hours: 'Prestation extérieure', special: true  },
  { day: 'Mercredi', jsDay: 3, hours: null,                   special: false },
  { day: 'Jeudi',    jsDay: 4, hours: 'Prestation extérieure', special: true  },
  { day: 'Vendredi', jsDay: 5, hours: '09h30 – 20h00',         special: false },
  { day: 'Samedi',   jsDay: 6, hours: '09h30 – 20h00',         special: false },
];

const todayJs = new Date().getDay();

const SCHEDULE = RAW_SCHEDULE.map((entry) => ({
  ...entry,
  isToday: entry.jsDay === todayJs,
  display: entry.hours ?? 'Fermé',
}));

const todayEntry = SCHEDULE.find((e) => e.isToday)!;

const todayStatusClass = computed(() => {
  if (!todayEntry.hours)    return 'status--closed';
  if (todayEntry.special)   return 'status--special';
  return 'status--open';
});

const todayBadgeLabel = computed(() => {
  if (!todayEntry.hours)  return 'Fermé aujourd\'hui';
  if (todayEntry.special) return 'Disponible aujourd\'hui';
  return 'Ouvert aujourd\'hui';
});

// ── Actions ──
const handleAppointment = (service: Service) => {
  if (!localStorage.getItem('token')) {
    localStorage.setItem('desiredRoute', JSON.stringify({
      name: 'reservation',
      params: { service: service.name },
    }));
    authDialogVisible.value = true;
  } else {
    router.push({ name: 'reservation', params: { service: service.name } });
  }
};

const clearAuthDialog  = () => { authDialogVisible.value = false; };
const redirectToLogin  = () => { router.push({ name: 'connexion'  }); clearAuthDialog(); };
const redirectToSignup = () => { router.push({ name: 'inscription' }); clearAuthDialog(); };

onMounted(async () => {
  isLoaded.value = true;
  try {
    const [allServices, allCategories] = await Promise.all([
      serviceStore.fetchEntities(),
      categorieStore.fetchEntities(),
    ]);
    services.value   = allServices.filter((s: Service) => s.price > 0 && s.active !== false);
    categories.value = allCategories;
  } catch (e) {
    console.error('Erreur services/catégories:', e);
  } finally {
    isLoaded.value = false;
  }

  try {
    const allPhotos: Photo[] = await photoStore.fetchEntities();
    previewPhotos.value = shuffled(allPhotos).slice(0, 5);
  } catch (e) {
    console.error('Erreur photos:', e);
  } finally {
    photosLoading.value = false;
  }
});
</script>

<style scoped>
.home { background-color: var(--cream); }

/* ══════════════════════════════════════════
   TICKER
══════════════════════════════════════════ */
.ticker-wrapper {
  background-color: var(--taupe);
  overflow: hidden;
  padding: 13px 0;
  user-select: none;
}
.ticker-track {
  display: flex;
  white-space: nowrap;
  animation: ticker 30s linear infinite;
  will-change: transform;
}
.ticker-group {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding-right: 20px;
  flex-shrink: 0;
}
.ticker-item {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.88);
}
.ticker-dot { color: rgba(255,255,255,0.35); font-size: 0.55rem; }
@keyframes ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}

/* ══════════════════════════════════════════
   GALERIE APERÇU — BENTO ÉDITORIAL
══════════════════════════════════════════ */
.gallery-preview {
  padding: 72px 4% 0;
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-preview-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header { margin-bottom: 28px; }
.section-eyebrow {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--taupe);
  margin-bottom: 6px;
}
.section-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 0.03em;
}

/* ── Bento grid ── */
.bento-grid {
  display: grid;
  /* Mobile : featured image pleine largeur + 4 vignettes 2×2 */
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 52vw 33vw 33vw;
  gap: 5px;
}

/* Cellules bento */
.bento-cell {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: var(--blush);
}

.bento-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.bento-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(44, 36, 34, 0.55) 0%,
    rgba(44, 36, 34, 0.08) 50%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.bento-overlay .pi { font-size: 1.8rem; color: white; opacity: 0.9; }
.bento-cell:hover img { transform: scale(1.07); }
.bento-cell:hover .bento-overlay { opacity: 1; }

/* Mobile : image 0 = hero pleine largeur */
.bento-cell--0 { grid-column: 1 / 3; }
/* Images 1-4 remplissent 2×2 normalement (reset du desktop) */

/* ── Skeleton ── */
.skeleton-cell {
  background: linear-gradient(90deg, var(--blush) 25%, #ede0dd 50%, var(--blush) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* CTA */
.preview-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--text-dark);
  border: 1.5px solid var(--border-strong);
  padding: 11px 28px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  white-space: nowrap;
  transition: background-color 0.28s ease, color 0.28s ease, border-color 0.28s ease;
}
.preview-cta:hover {
  background: var(--taupe);
  border-color: var(--taupe);
  color: white;
}
.preview-cta .pi { font-size: 0.78rem; transition: transform 0.25s ease; }
.preview-cta:hover .pi { transform: translateX(4px); }

/* Masquer le CTA inline sur mobile, afficher le CTA mobile en dessous */
.gallery-preview-header .preview-cta { display: none; }
.preview-cta-wrap-mobile {
  display: flex;
  justify-content: center;
  padding: 28px 0 64px;
}

/* ══════════════════════════════════════════
   CITATION
══════════════════════════════════════════ */
.quote-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 60px 24px;
  background-color: var(--blush);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.quote-line { width: 40px; height: 1px; background: var(--taupe); opacity: 0.5; }
.quote-text {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.3rem, 3.5vw, 1.9rem);
  font-weight: 400;
  font-style: italic;
  color: var(--text-dark);
  text-align: center;
  line-height: 1.55;
  max-width: 640px;
  letter-spacing: 0.02em;
}
.quote-text em { color: var(--taupe); font-style: italic; }
.quote-author {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ══════════════════════════════════════════
   SECTION BOOKING
══════════════════════════════════════════ */
.booking-section {
  background-color: var(--cream);
  padding: 72px 0 88px;
  scroll-margin-top: 76px; /* compense la navbar sticky */
}
.booking-inner {
  width: 92%;
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 64px;
}

/* ── Onglets catégories ── */
.cat-tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  margin-bottom: 28px;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.cat-tabs::-webkit-scrollbar { display: none; }

.cat-tab {
  flex-shrink: 0;
  background: transparent;
  color: var(--text-muted);
  border: 1.5px solid var(--border-color);
  padding: 8px 18px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 100px;
  transition: all 0.22s ease;
  white-space: nowrap;
}
.cat-tab:hover {
  border-color: var(--taupe);
  color: var(--taupe);
}
.cat-tab.active {
  background: var(--taupe);
  border-color: var(--taupe);
  color: white;
}

/* ── Menu spa de prestations ── */
.services-menu {
  background: var(--white);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition:
    border-left-color 0.22s ease,
    background-color 0.22s ease;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:hover {
  border-left-color: var(--taupe);
  background-color: rgba(166, 124, 136, 0.04);
}

.menu-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.menu-item-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.08rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.menu-item-duration {
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu-item-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.menu-item-price {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--taupe);
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.menu-item-btn {
  background: transparent;
  color: var(--taupe);
  border: 1.5px solid var(--taupe);
  padding: 7px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  white-space: nowrap;
  transition: background-color 0.22s ease, color 0.22s ease;
}
.menu-item:hover .menu-item-btn {
  background: var(--taupe);
  color: white;
}

.no-services {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 20px 0;
}

/* Transition fade liste */
.fade-list-enter-active, .fade-list-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-list-enter-from, .fade-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ── Horaires ── */
.today-status {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 2px;
  margin-bottom: 20px;
  border: 1px solid transparent;
}
.status--open {
  background: rgba(74, 160, 112, 0.08);
  border-color: rgba(74, 160, 112, 0.25);
}
.status--closed {
  background: rgba(150, 120, 120, 0.07);
  border-color: rgba(150, 120, 120, 0.2);
}
.status--special {
  background: rgba(200, 168, 130, 0.12);
  border-color: rgba(200, 168, 130, 0.35);
}

.today-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status--open    .today-dot { background: #4aa070; box-shadow: 0 0 0 3px rgba(74,160,112,0.2); }
.status--closed  .today-dot { background: #a08080; box-shadow: 0 0 0 3px rgba(150,120,120,0.15); }
.status--special .today-dot { background: var(--gold); box-shadow: 0 0 0 3px rgba(200,168,130,0.25); }

.today-info { display: flex; flex-direction: column; gap: 2px; }
.today-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.status--open    .today-label { color: #3a9060; }
.status--closed  .today-label { color: #8a6060; }
.status--special .today-label { color: #9a7840; }
.today-hours { font-size: 0.82rem; color: var(--text-muted); font-style: italic; }

.hours-list {
  background: var(--white);
  border: 1px solid var(--border-color);
  overflow: hidden;
  margin-bottom: 16px;
}
.hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 18px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.15s ease;
}
.hours-row:last-child { border-bottom: none; }
.hours-row--today {
  background: rgba(166,124,136,0.07);
  position: relative;
}

.hours-day {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dark);
  min-width: 90px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.today-marker { color: var(--taupe); font-size: 0.7rem; }

.hours-time {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: right;
}
.hours-time--closed { opacity: 0.38; }
.hours-time--special { color: var(--gold); font-style: italic; }

.hours-note {
  font-size: 0.73rem;
  color: var(--text-muted);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
}
.hours-note .pi { font-size: 0.7rem; }

.address-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--blush);
  border: 1px solid var(--border-color);
  padding: 18px 20px;
  border-radius: 2px;
}
.address-icon { color: var(--taupe); font-size: 1.1rem; margin-top: 2px; flex-shrink: 0; }
.address-street { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }
.address-city { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
.address-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.address-link:hover { color: var(--taupe-dark); }

/* ── Dialog ── */
.dialog-text {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.65;
}
.dialog-actions { display: flex; flex-direction: column; gap: 10px; }
.btn-dialog {
  background: var(--taupe);
  color: white;
  border: 1.5px solid var(--taupe);
  padding: 12px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.25s ease;
}
.btn-dialog:hover { background: var(--taupe-dark); border-color: var(--taupe-dark); }
.btn-dialog--outline { background: transparent; color: var(--taupe); }
.btn-dialog--outline:hover { background: var(--blush); }

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
/* ── Bento : layout éditorial tablette/desktop ── */
@media (min-width: 640px) {
  .bento-grid {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 260px 260px;
  }
  /* Image 0 : grande, colonne 1 sur 2 rangées */
  .bento-cell--0 { grid-column: 1; grid-row: 1 / 3; }
  /* Images 1–4 : colonnes 2-3 × rangées 1-2 */
  .bento-cell--1 { grid-column: 2; grid-row: 1; }
  .bento-cell--2 { grid-column: 3; grid-row: 1; }
  .bento-cell--3 { grid-column: 2; grid-row: 2; }
  .bento-cell--4 { grid-column: 3; grid-row: 2; }

  .gallery-preview-header .preview-cta { display: inline-flex; }
  .preview-cta-wrap-mobile { display: none; }
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: 2.2fr 1fr 1fr;
    grid-template-rows: 320px 320px;
    gap: 10px;
  }
}

@media (min-width: 760px) {
  .gallery-preview { padding: 80px 5% 0; }
  .booking-inner { flex-direction: row; align-items: flex-start; }
  .services-col { flex: 1.5; }
  .hours-col    { flex: 1; min-width: 280px; }
  .dialog-actions { flex-direction: row; justify-content: flex-end; }
}
</style>
