<template>
  <div class="modern-calendar">
    <div class="calendar-header">
      <button 
        @click="previousMonth" 
        class="nav-button"
        :disabled="!canNavigateToPrevious"
      >
        <i class="pi pi-chevron-left"></i>
      </button>
      
      <h3 class="month-year">
        {{ formatMonthYear(currentDate) }}
      </h3>
      
      <button 
        @click="nextMonth" 
        class="nav-button"
        :disabled="!canNavigateToNext"
      >
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <div class="calendar-grid">
      <div class="day-header" v-for="day in dayHeaders" :key="day">
        {{ day }}
      </div>
      
      <div 
        v-for="day in calendarDays" 
        :key="`${day.date}-${day.month}`"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'disabled': day.isDisabled,
          'available': day.isAvailable && day.hasAvailableSlots,
          'no-slots': day.isAvailable && !day.hasAvailableSlots,
          'selected': day.isSelected,
          'today': day.isToday
        }"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.day }}</span>
        <div v-if="day.isAvailable" class="availability-indicator">
          <div class="dot" :class="{ 'dot-unavailable': !day.hasAvailableSlots }"></div>
        </div>
      </div>
    </div>

    <div v-if="selectedDateInfo" class="selected-date-info">
      <div class="date-display">
        <i class="pi pi-calendar"></i>
        <span>{{ selectedDateInfo }}</span>
      </div>
    </div>

    <!-- Popup pour les créneaux horaires -->
    <TimeSlotsPopup
      :visible="showTimeSlotsPopup"
      :selectedDate="popupSelectedDate || undefined"
      :timeSlots="popupTimeSlots"
      @close="closeTimeSlotsPopup"
      @time-selected="onTimeSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import TimeSlotsPopup from './TimeSlotsPopup.vue';

// Interface pour les jours du calendrier
interface CalendarDay {
  day: number;
  date: number;
  month: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isDisabled: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasAvailableSlots: boolean;
}

// Interface pour les créneaux horaires
interface TimeSlot {
  label: string;
  value: string | null;
  disabled?: boolean;
}

// Props
const props = defineProps({
  modelValue: {
    type: [Date, Object] as any,
    default: null
  },
  disabledDays: {
    type: Array,
    default: () => [0] // Dimanche par défaut
  },
  minDate: {
    type: Date,
    default: () => new Date()
  },
  maxDate: {
    type: Date,
    default: null
  },

  service: {
    type: Object,
    default: null
  },
  appointments: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'date-select', 'slots-available', 'time-selected']);

// État réactif
const currentDate = ref(new Date());
const selectedDate = ref(props.modelValue);

// État pour la popup
const showTimeSlotsPopup = ref(false);
const popupSelectedDate = ref<Date | null>(null);
const popupTimeSlots = ref<TimeSlot[]>([]);

// Fonction pour vérifier les créneaux disponibles pour une date donnée
const checkAvailableSlots = (date: Date): boolean => {
  if (!props.service) {
    return false; // Pas de service, pas de créneaux
  }
  
  // Vérifier les créneaux pour cette date
  const slots = getAvailableTimesForDate(date);
  return slots.length > 0;
};

/** Clé YYYY-MM-DD du calendrier local (évite les décalages UTC / DST entre « aujourd’hui » et la date choisie). */
const formatLocalDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Fonction pour obtenir les créneaux disponibles pour une date
const getAvailableTimesForDate = (date: Date): TimeSlot[] => {
  if (!props.service || !props.appointments) return [];
  
  const interval = 30;
  let startHour = 9;
  let startMinute = 30;
  const times: TimeSlot[] = [];
  const now = new Date();
  
  const dayOfWeek = date.getDay();
  const serviceDuration = props.service.duration;
  
  // Filtrer les rendez-vous pour la date sélectionnée (même jour civil local que le calendrier)
  const selectedDateKey = formatLocalDateKey(date);
  const appointmentsForSelectedDate = props.appointments.filter((appointment: any) => {
    const appointmentDate = new Date(appointment.date);
    return formatLocalDateKey(appointmentDate) === selectedDateKey;
  });
  
  // Logique spécifique pour le 24/12/2025 et le 31/12/2025 (9h-16h uniquement)
  // Comparer directement année, mois et jour pour éviter les problèmes de fuseau horaire
  const dateYear = date.getFullYear();
  const dateMonth = date.getMonth(); // 0-11 (décembre = 11)
  const dateDay = date.getDate();
  const isSpecialDate = (dateYear === 2025 && dateMonth === 11 && (dateDay === 24 || dateDay === 31));
  if (isSpecialDate) {
    startHour = 9;
    startMinute = 0;
  }
  
  // Génération des créneaux horaires
  const maxHour = isSpecialDate ? 16 : 20;
  for (let hour = startHour; hour <= maxHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      let minutes = minute + startMinute;
      
      const time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minutes, 0, 0);
      const endTime = new Date(time.getTime() + serviceDuration * 60000);
      
      // Pour les dates spéciales (24/12 et 31/12), ignorer les restrictions de jours
      // Seulement vérifier que le créneau ne dépasse pas 16h
      if (isSpecialDate) {
        if (endTime.getHours() > 16 || (endTime.getHours() === 16 && endTime.getMinutes() > 0)) {
          continue;
        }
      } else {
        // Appliquer les restrictions spécifiques aux jours
        if (
          // Lundi :
          (dayOfWeek === 1 &&
            (
              // Exclu le rdv qui commence entre 16h et 17h30
              (time.getHours() >= 16 && time.getHours() <= 17)
              ||
              // Exclu le rdv qui commence à 18h00
              (time.getHours() === 18 && time.getMinutes() === 0)
              ||
              // Exclu le rdv qui commence avant 16h00 et qui fini après 16h00
              (time.getHours() <= 16 && (endTime.getHours() > 16 || (endTime.getHours() >= 16 && endTime.getMinutes() > 0)))
            )
          )
          ||
          // Exclu le rdv qui fini après 20h00
          (endTime.getHours() > 20)
          ||
          // Exclu le rdv qui fini à 20h30
          (endTime.getHours() === 20 && endTime.getMinutes() > 0)
          ||
          // Exclu le rdv qui fini entre 00h00 et 09h30
          (endTime.getHours() >= 0 && (endTime.getHours() <= 9 && endTime.getMinutes() === 0))
          ||
          // Exclu les rdv qui commencent après 20h
          (time.getHours() > 20)
        ) {
          continue; // Exclure ce créneau s'il ne respecte pas les restrictions
        }
      }
      
      
      // Vérifier que l'heure n'est pas dans le passé
      if (time > now) {
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSlotTaken = isTimeSlotTaken(timeString, appointmentsForSelectedDate, date);
        
        if (!isSlotTaken) {
          times.push({ label: timeString, value: timeString });
        }
      }
    }
  }
  
  // Ne pas ajouter de faux message - si pas de créneaux, le jour sera marqué comme indisponible
  
  return times;
};

// Fonction pour vérifier si un créneau est pris
const isTimeSlotTaken = (time: string, appointmentsForSelectedDate: any[], selectedDate: Date): boolean => {
  if (!props.service) return false;
  
  const [hour, minute] = time.split(':').map(Number);
  const selectedTimeDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    hour,
    minute,
    0,
    0
  );
  
  const serviceDuration = props.service.duration;
  const selectedEndTimeDate = new Date(selectedTimeDate.getTime() + serviceDuration * 60000);
  
  return appointmentsForSelectedDate.some(appointment => {
    const appointmentStart = new Date(appointment.date);
    const appointmentEnd = new Date(appointment.endDate);
    
    return (
      (selectedTimeDate >= appointmentStart && selectedTimeDate < appointmentEnd) ||
      (selectedEndTimeDate > appointmentStart && selectedEndTimeDate <= appointmentEnd) ||
      (selectedTimeDate < appointmentEnd && selectedEndTimeDate > appointmentStart)
    );
  });
};

// Headers des jours de la semaine
const dayHeaders = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Formatage du mois et année
const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, c => c.toUpperCase());
};

// Navigation
const canNavigateToPrevious = computed(() => {
  const firstDayOfCurrentMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  return firstDayOfCurrentMonth > props.minDate;
});

const canNavigateToNext = computed(() => {
  if (!props.maxDate) return true;
  const lastDayOfCurrentMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);
  return lastDayOfCurrentMonth < props.maxDate;
});

const previousMonth = () => {
  if (canNavigateToPrevious.value) {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
  }
};

const nextMonth = () => {
  if (canNavigateToNext.value) {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
  }
};

// Génération du calendrier
const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Premier jour du mois et combien de jours dans le mois
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Ajuster pour que lundi soit le premier jour (0 = dimanche, 1 = lundi...)
  let startOfWeek = firstDay.getDay();
  startOfWeek = startOfWeek === 0 ? 6 : startOfWeek - 1;
  
  const days: CalendarDay[] = [];
  
  // Jours du mois précédent
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    const date = new Date(year, month - 1, day);
    days.push({
      day,
      date: date.getDate(),
      month: month - 1,
      fullDate: date,
      isCurrentMonth: false,
      isDisabled: true,
      isAvailable: false,
      isSelected: false,
      isToday: false,
      hasAvailableSlots: false
    });
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isDisabledDay = props.disabledDays.includes(dayOfWeek);
    
    // Vérifier si c'est une date spéciale (24/12 ou 31/12/2025)
    // Comparer directement année, mois et jour pour éviter les problèmes de fuseau horaire
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth(); // 0-11 (décembre = 11)
    const dateDay = date.getDate();
    const isSpecialDate = (dateYear === 2025 && dateMonth === 11 && (dateDay === 24 || dateDay === 31));
    
      
    let isDateRestricted = false;
    // Les dates spéciales ne sont jamais restreintes par les jours de la semaine
    if (!isSpecialDate) {
      isDateRestricted = !(dayOfWeek === 1 || dayOfWeek === 5 || dayOfWeek === 6); // Pas lundi, vendredi ou samedi
    }
    
    // Pour les dates spéciales, ignorer aussi isDisabledDay (ex: mercredi peut être dans disabledDays)
    const effectiveDisabledDay = isSpecialDate ? false : isDisabledDay;
    
    const isDisabled = isPast || effectiveDisabledDay || isDateRestricted || 
                      (props.minDate && date < props.minDate) ||
                      (props.maxDate && date > props.maxDate);
    
    const isAvailable = !isDisabled;
    const hasAvailableSlots = isAvailable ? checkAvailableSlots(date) : false;
    const isSelected = selectedDate.value && 
                      date.getTime() === selectedDate.value.getTime();
    
    days.push({
      day,
      date: day,
      month,
      fullDate: date,
      isCurrentMonth: true,
      isDisabled,
      isAvailable,
      isSelected,
      isToday,
      hasAvailableSlots
    });
  }
  
  // Compléter avec les jours du mois suivant
  const remainingCells = 42 - days.length; // 6 semaines × 7 jours
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      day,
      date: day,
      month: month + 1,
      fullDate: date,
      isCurrentMonth: false,
      isDisabled: true,
      isAvailable: false,
      isSelected: false,
      isToday: false,
      hasAvailableSlots: false
    });
  }
  
  return days;
});

// Sélection de date
const selectDate = (day: CalendarDay) => {
  // Empêcher le clic sur les jours désactivés, autres mois, ou sans créneaux
  if (day.isDisabled || !day.isCurrentMonth || !day.hasAvailableSlots) return;
  
  selectedDate.value = day.fullDate;
  emit('update:modelValue', day.fullDate);
  emit('date-select', day.fullDate);
  
  // Obtenir les créneaux disponibles pour cette date
  const availableSlots = getAvailableTimesForDate(day.fullDate);
  emit('slots-available', availableSlots);
  
  // Ouvrir la popup seulement s'il y a des créneaux disponibles
  if (availableSlots.length > 0) {
    popupSelectedDate.value = day.fullDate;
    popupTimeSlots.value = availableSlots;
    showTimeSlotsPopup.value = true;
  }
};

// Gestion de la popup
const closeTimeSlotsPopup = () => {
  showTimeSlotsPopup.value = false;
  popupSelectedDate.value = null;
  popupTimeSlots.value = [];
};

const onTimeSelected = (selectedTime: string) => {
  emit('time-selected', selectedTime);
  closeTimeSlotsPopup();
};

// Fonction pour ouvrir la popup depuis l'extérieur
const openTimeSlotsPopup = () => {
  if (selectedDate.value) {
    const availableSlots = getAvailableTimesForDate(selectedDate.value);
    if (availableSlots.length > 0) {
      popupSelectedDate.value = selectedDate.value;
      popupTimeSlots.value = availableSlots;
      showTimeSlotsPopup.value = true;
    }
  }
};

// Exposer la fonction pour l'utilisation parent
defineExpose({
  openTimeSlotsPopup
});

// Information sur la date sélectionnée
const selectedDateInfo = computed(() => {
  if (!selectedDate.value) return null;
  
  return selectedDate.value.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Watcher pour synchroniser avec le modelValue
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue;
  if (newValue) {
    currentDate.value = new Date(newValue.getFullYear(), newValue.getMonth());
  }
});

// Watcher pour forcer la re-génération quand service ou appointments changent
watch([() => props.service, () => props.appointments], () => {
  // Force le recalcul des jours du calendrier en modifiant la date de référence
  currentDate.value = new Date(currentDate.value);
}, { deep: true });

// Initialisation
onMounted(() => {
  if (props.modelValue) {
    currentDate.value = new Date(props.modelValue.getFullYear(), props.modelValue.getMonth());
  }
});
</script>

<style scoped>
.modern-calendar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 400px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.nav-button {
  background: var(--taupe, #8B7355);
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

.nav-button:hover:not(:disabled) {
  background: var(--taupe-dark, #6d5a44);
  transform: translateY(-1px);
}

.nav-button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #999;
}

.month-year {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--taupe, #8B7355);
  margin: 0;
  text-align: center;
  flex: 1;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  color: var(--taupe, #8B7355);
  padding: 12px 0;
  font-size: 0.875rem;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  min-height: 48px;
}

.day-number {
  font-weight: 500;
  font-size: 0.95rem;
}

.day-cell.other-month {
  opacity: 0.3;
  cursor: default;
}

.day-cell.disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #f8f8f8;
}

.day-cell.available {
  color: var(--taupe, #8B7355);
  background: #f8f6f3;
  border: 2px solid transparent;
  cursor: pointer;
}

.day-cell.available:hover {
  background: var(--taupe, #8B7355);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
}

.day-cell.no-slots {
  color: #adb5bd;
  background: #f8f9fa;
  border: 2px solid transparent;
  cursor: not-allowed;
  opacity: 0.6;
}

.day-cell.no-slots:hover {
  background: #f8f9fa;
  color: #adb5bd;
  transform: none;
  box-shadow: none;
}

.day-cell.selected {
  background: var(--taupe, #8B7355);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.4);
}

.day-cell.today {
  border: 2px solid var(--taupe, #8B7355);
  font-weight: 600;
}

.day-cell.today.available:not(.selected) {
  background: rgba(139, 115, 85, 0.1);
}

.availability-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
  transition: background-color 0.3s ease;
}

.dot-unavailable {
  background: #ef4444 !important;
  animation: pulseRed 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pulseRed {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.selected-date-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  color: var(--taupe, #8B7355);
  font-size: 1rem;
}

.date-display i {
  color: var(--taupe, #8B7355);
}

/* Responsive */
@media (max-width: 480px) {
  .modern-calendar {
    padding: 16px;
    margin: 0 10px;
  }
  
  .month-year {
    font-size: 1.25rem;
  }
  
  .day-cell {
    min-height: 44px;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
}

/* Animation d'entrée */
.modern-calendar {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>