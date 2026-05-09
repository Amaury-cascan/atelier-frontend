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

    <!-- Légende -->
    <div class="calendar-legend">
      <span class="legend-item"><span class="legend-dot legend-dot--available"></span>Disponible</span>
      <span class="legend-item"><span class="legend-dot legend-dot--none"></span>Complet</span>
      <span class="legend-item"><span class="legend-dot legend-dot--selected"></span>Sélectionné</span>
    </div>

    <div v-if="selectedDateInfo" class="selected-date-info">
      <div class="date-display">
        <i class="pi pi-check-circle"></i>
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
  },
  /** Si false, n'ouvre pas la popup interne — le parent gère les créneaux via @slots-available */
  showPopup: {
    type: Boolean,
    default: true
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
  
  // Ouvrir la popup interne seulement si showPopup est activé
  if (props.showPopup && availableSlots.length > 0) {
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
/* ── Calendrier ── */
.modern-calendar {
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 0;
  box-shadow: var(--shadow-sm);
  padding: 24px;
  font-family: 'Montserrat', sans-serif;
  max-width: 420px;
  animation: fadeUp 0.3s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header mois ── */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.nav-button {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  color: var(--text-muted);
}
.nav-button:hover:not(:disabled) {
  background: var(--taupe);
  border-color: var(--taupe);
  color: white;
}
.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-year {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: var(--text-dark);
  margin: 0;
  text-align: center;
  flex: 1;
  letter-spacing: 0.04em;
}

/* ── Grille ── */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.day-header {
  text-align: center;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 10px 0;
  text-transform: uppercase;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
  background: transparent;
  min-height: 40px;
}

.day-number {
  font-size: 0.85rem;
  font-weight: 500;
}

.day-cell.other-month {
  opacity: 0.2;
  cursor: default;
}

.day-cell.disabled {
  color: var(--border-strong);
  cursor: not-allowed;
  background: transparent;
}

.day-cell.available {
  color: var(--text-dark);
  background: var(--blush);
  cursor: pointer;
}
.day-cell.available:hover {
  background: var(--taupe);
  color: white;
}

.day-cell.no-slots {
  color: var(--text-muted);
  background: transparent;
  cursor: not-allowed;
  opacity: 0.45;
}

.day-cell.selected {
  background: var(--taupe);
  color: white;
  font-weight: 600;
}

.day-cell.today {
  outline: 1.5px solid var(--taupe);
  outline-offset: -1.5px;
  font-weight: 600;
}
.day-cell.today.available:not(.selected) {
  background: rgba(174, 120, 112, 0.1);
}

/* ── Indicateur disponibilité ── */
.availability-indicator {
  position: absolute;
  bottom: 3px;
  right: 3px;
}
.dot {
  width: 5px;
  height: 5px;
  background: #5cb88a;
  border-radius: 50%;
  animation: pulse 2.5s ease infinite;
}
.dot-unavailable {
  background: #c47070 !important;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* ── Légende ── */
.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 0 0;
  border-top: 1px solid var(--border-color);
  margin-top: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-dot--available { background: #5cb88a; }
.legend-dot--none      { background: #c47070; }
.legend-dot--selected  { background: var(--taupe); }

/* ── Info date sélectionnée ── */
.selected-date-info {
  margin-top: 14px;
  padding: 12px 16px;
  background: var(--blush);
  border-left: 3px solid var(--taupe);
}
.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--taupe);
  text-transform: capitalize;
}
.date-display i { font-size: 0.82rem; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .modern-calendar { padding: 16px; }
  .month-year { font-size: 1.1rem; }
  .day-cell { min-height: 36px; }
  .day-number { font-size: 0.8rem; }
}
</style>