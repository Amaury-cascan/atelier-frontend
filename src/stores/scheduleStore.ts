import { defineStore } from 'pinia';
import { ref } from 'vue';
import axiosInstance from '@/services/api';
import {
  setScheduleSnapshot,
  type ScheduleSnapshot,
  type ScheduleVersionPayload,
  type ScheduleExceptionPayload,
  type BlockedSlotPayload,
} from '@/utils/openingHours';

export const useScheduleStore = defineStore('schedule', () => {
  const loaded = ref(false);
  const loading = ref(false);
  const versions = ref<ScheduleVersionPayload[]>([]);
  const weekly = ref<ScheduleSnapshot['weekly']>([]);
  const exceptions = ref<ScheduleExceptionPayload[]>([]);
  const blockedSlots = ref<BlockedSlotPayload[]>([]);

  const apply = (data: ScheduleSnapshot) => {
    versions.value = data.versions ?? [];
    weekly.value = data.weekly ?? [];
    exceptions.value = data.exceptions ?? [];
    blockedSlots.value = data.blockedSlots ?? [];
    setScheduleSnapshot({
      versions: versions.value,
      weekly: weekly.value,
      exceptions: exceptions.value,
      blockedSlots: blockedSlots.value,
    });
    loaded.value = true;
  };

  const fetchPublic = async () => {
    loading.value = true;
    try {
      const { data } = await axiosInstance.get('schedule');
      apply({
        versions: data.versions ?? [],
        weekly: data.weekly ?? [],
        exceptions: data.exceptions ?? [],
        blockedSlots: data.blockedSlots ?? [],
      });
    } catch (e) {
      console.error('Chargement horaires impossible', e);
      setScheduleSnapshot(null);
    } finally {
      loading.value = false;
    }
  };

  const fetchAdmin = async () => {
    loading.value = true;
    try {
      const { data } = await axiosInstance.get('admin/schedule');
      apply({
        versions: data.versions ?? [],
        weekly: data.weekly ?? [],
        exceptions: data.exceptions ?? [],
        blockedSlots: data.blockedSlots ?? [],
      });
    } catch (e) {
      console.error('Chargement horaires admin impossible', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loaded,
    loading,
    versions,
    weekly,
    exceptions,
    blockedSlots,
    fetchPublic,
    fetchAdmin,
    apply,
  };
});
