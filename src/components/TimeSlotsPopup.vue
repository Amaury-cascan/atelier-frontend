<template>
  <div 
    v-if="visible" 
    class="popup-overlay"
    @click="closePopup"
  >
    <div 
      class="popup-container"
      @click.stop
    >
      <!-- Header dramatique -->
      <div class="popup-header">
        <div class="popup-header-top">
          <p class="popup-eyebrow">Créneaux disponibles</p>
          <button class="close-btn" @click="closePopup">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <h3 class="popup-date">{{ formatSelectedDate }}</h3>
        <p class="popup-subtitle">Sélectionnez l'heure de votre choix</p>
      </div>

      <!-- Contenu des créneaux -->
      <div class="popup-content">
        <div v-if="availableSlots.length === 0" class="no-slots">
          <div class="no-slots-icon">
            <i class="pi pi-calendar-times"></i>
          </div>
          <h4>Aucun créneau disponible</h4>
          <p>Veuillez choisir une autre date</p>
        </div>

        <div v-else class="time-slots-grid">
          <div 
            v-for="(slot, index) in availableSlots" 
            :key="slot.value || `slot-${index}`"
            class="time-slot"
            :class="{ 'selected': selectedTime === slot.value }"
            @click="selectTime(slot)"
          >
            <div class="time-display">
              <span class="time">{{ slot.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer avec boutons d'action -->
      <div class="popup-footer" v-if="availableSlots.length > 0">
        <button class="btn-cancel" @click="closePopup">
          Annuler
        </button>
        <button 
          class="btn-confirm" 
          :disabled="!selectedTime"
          @click="confirmSelection"
        >
          <i class="pi pi-check"></i>
          Confirmer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Interfaces
interface TimeSlot {
  label: string;
  value: string | null;
  disabled?: boolean;
}

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: Date,
    default: null
  },
  timeSlots: {
    type: Array as () => TimeSlot[],
    default: () => []
  }
});

// Emits
const emit = defineEmits(['close', 'time-selected']);

// État réactif
const selectedTime = ref<string | null>(null);

// Computed
const formatSelectedDate = computed(() => {
  if (!props.selectedDate) return '';
  const d = props.selectedDate;
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' });
  const day     = d.getDate();
  const month   = d.toLocaleDateString('fr-FR', { month: 'long' });
  const year    = d.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
});

const availableSlots = computed(() => {
  return props.timeSlots.filter(slot => !slot.disabled && slot.value);
});

// Méthodes
const closePopup = () => {
  selectedTime.value = null;
  emit('close');
};

const selectTime = (slot: TimeSlot) => {
  if (slot.disabled || !slot.value) return;
  selectedTime.value = slot.value;
};

const confirmSelection = () => {
  if (selectedTime.value) {
    emit('time-selected', selectedTime.value);
    closePopup();
  }
};

// Watcher pour réinitialiser la sélection quand la popup s'ouvre
watch(() => props.visible, (newValue) => {
  if (newValue) {
    selectedTime.value = null;
  }
});

// Gestion des touches clavier
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePopup();
  }
};

// Ajouter/supprimer les écouteurs d'événements
watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
/* ══ Overlay ══ */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 30, 28, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1200;
  animation: fadeIn 0.22s ease-out;
}

/* ══ Container — bottom sheet sur mobile, centré sur desktop ══ */
.popup-container {
  background: var(--white);
  box-shadow: 0 -8px 40px rgba(42, 30, 28, 0.18), 0 0 0 1px var(--border-color);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ══ Header ══ */
.popup-header {
  background: var(--taupe);
  padding: 24px 28px 22px;
  flex-shrink: 0;
  position: relative;
}

.popup-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.popup-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
  margin: 0;
}

.close-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}
.close-btn:hover { background: rgba(255,255,255,0.25); }

.popup-date {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 300;
  color: white;
  letter-spacing: 0.04em;
  text-transform: capitalize;
  margin: 0 0 6px;
  line-height: 1.15;
}

.popup-subtitle {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.65);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.06em;
}

/* ══ Contenu ══ */
.popup-content {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

/* Grille de créneaux */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
}

.time-slot {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 14px 8px;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.time-slot::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--taupe);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.22s ease;
  z-index: 0;
}

.time-slot:hover::after,
.time-slot.selected::after {
  transform: scaleY(1);
}

.time-display {
  position: relative;
  z-index: 1;
}

.time {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.04em;
  transition: color 0.18s ease;
}

.time-slot:hover .time,
.time-slot.selected .time { color: white; }

/* Aucun créneau */
.no-slots {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
}
.no-slots-icon {
  font-size: 2.2rem;
  margin-bottom: 14px;
  color: var(--taupe);
  opacity: 0.4;
}
.no-slots h4 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--text-dark);
  margin: 0 0 8px;
}
.no-slots p {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* ══ Footer ══ */
.popup-footer {
  background: var(--blush);
  padding: 16px 28px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.btn-cancel, .btn-confirm {
  padding: 12px 28px;
  border-radius: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.22s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
}
.btn-cancel:hover {
  border-color: var(--taupe);
  color: var(--taupe);
}

.btn-confirm {
  background: var(--taupe);
  border: 1px solid var(--taupe);
  color: white;
}
.btn-confirm:hover:not(:disabled) { background: var(--taupe-dark); border-color: var(--taupe-dark); }
.btn-confirm:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ══ Animations ══ */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(48px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══ Scrollbar ══ */
.popup-content::-webkit-scrollbar { width: 3px; }
.popup-content::-webkit-scrollbar-track { background: transparent; }
.popup-content::-webkit-scrollbar-thumb { background: var(--border-strong); }

/* ══ Desktop : centré plutôt que bottom-sheet ══ */
@media (min-width: 640px) {
  .popup-overlay {
    align-items: center;
  }
  .popup-container {
    border-radius: 0;
    max-height: 82vh;
    animation: slideCenter 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
}
@keyframes slideCenter {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>