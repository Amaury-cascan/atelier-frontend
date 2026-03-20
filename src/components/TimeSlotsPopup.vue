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
      <!-- Header avec date et bouton fermer -->
      <div class="popup-header">
        <div class="date-info">
          <i class="pi pi-calendar-plus"></i>
          <div>
            <h3>{{ formatSelectedDate }}</h3>
            <p>Choisissez votre créneau</p>
          </div>
        </div>
        <button class="close-btn" @click="closePopup">
          <i class="pi pi-times"></i>
        </button>
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
  
  return props.selectedDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.popup-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  position: relative;
}

.popup-header {
  background: linear-gradient(135deg, var(--taupe, #8B7355) 0%, #a08670 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-info i {
  font-size: 2rem;
  opacity: 0.9;
}

.date-info h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: capitalize;
}

.date-info p {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.popup-content {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.time-slot {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-slot:hover {
  background: var(--taupe, #8B7355);
  color: white;
  border-color: var(--taupe, #8B7355);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 115, 85, 0.3);
}

.time-slot.selected {
  background: var(--taupe, #8B7355);
  color: white;
  border-color: var(--taupe, #8B7355);
  box-shadow: 0 8px 24px rgba(139, 115, 85, 0.4);
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-weight: 600;
  font-size: 1.1rem;
}


.no-slots {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-slots-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-slots h4 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  color: #495057;
}

.no-slots p {
  margin: 0;
  font-size: 1rem;
}

.popup-footer {
  background: #f8f9fa;
  padding: 20px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e9ecef;
}

.btn-cancel, .btn-confirm {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.btn-cancel {
  background: transparent;
  border: 2px solid #dee2e6;
  color: #6c757d;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-confirm {
  background: var(--taupe, #8B7355);
  border: 2px solid var(--taupe, #8B7355);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #6d5a44;
  border-color: #6d5a44;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
}

.btn-confirm:disabled {
  background: #dee2e6;
  border-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Responsive */
@media (max-width: 600px) {
  .popup-container {
    width: 95vw;
    border-radius: 20px;
  }
  
  .popup-header {
    padding: 20px;
  }
  
  .date-info h3 {
    font-size: 1.2rem;
  }
  
  .popup-content {
    padding: 20px;
  }
  
  .time-slots-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .time-slot {
    padding: 14px 10px;
  }
  
  .time {
    font-size: 1rem;
  }
  
  .popup-footer {
    padding: 16px 20px;
  }
  
  .btn-cancel, .btn-confirm {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}

/* Scrollbar personnalisée */
.popup-content::-webkit-scrollbar {
  width: 6px;
}

.popup-content::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.popup-content::-webkit-scrollbar-thumb {
  background: #c1c8cd;
  border-radius: 3px;
}

.popup-content::-webkit-scrollbar-thumb:hover {
  background: #a8b2ba;
}
</style>