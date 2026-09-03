<template>
  <section class="adm-page gallery">
    <header class="adm-hero">
      <div>
        <p class="adm-eyebrow">Médias</p>
        <h1 class="adm-title">Images</h1>
        <p class="adm-subtitle">Galerie du salon — photos mises en avant sur le site.</p>
      </div>
      <Button label="Ajouter une image" icon="pi pi-upload" @click="openCreate" />
    </header>

    <p v-if="loading" class="loading-veil"><i class="pi pi-spin pi-spinner" /> Chargement…</p>

    <div v-else class="grid">
      <article v-for="p in pictures" :key="p.id" class="card adm-panel">
        <button type="button" class="media" @click="openLightbox(p)">
          <img :src="imageUrl(p.picture)" :alt="p.description || 'Photo du salon'" />
          <div class="overlay" @click.stop>
            <Button icon="pi pi-search-plus" rounded title="Agrandir" aria-label="Agrandir" @click="openLightbox(p)" />
            <Button icon="pi pi-pencil" rounded title="Modifier" aria-label="Modifier" @click="openEdit(p)" />
            <Button icon="pi pi-trash" rounded severity="danger" title="Supprimer" aria-label="Supprimer" @click="remove(p)" />
          </div>
        </button>
        <p class="caption">{{ p.description || 'Sans description' }}</p>
      </article>

      <div v-if="!pictures.length" class="empty adm-panel">
        <i class="pi pi-images" />
        <p>La galerie est vide.</p>
        <Button label="Ajouter la première photo" icon="pi pi-upload" @click="openCreate" />
      </div>
    </div>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editingId ? 'Modifier l’image' : 'Nouvelle image'"
      :style="{ width: 'min(480px, 94vw)' }"
      :draggable="false"
    >
      <form class="form" @submit.prevent="save">
        <label>
          <span>Description</span>
          <InputText v-model="form.description" class="w-full" placeholder="Ambiance, soin, détail…" />
        </label>
        <label>
          <span>Fichier {{ editingId ? '(optionnel)' : '' }}</span>
          <input
            type="file"
            accept="image/*"
            class="file-input"
            :required="!editingId"
            @change="onFile"
          />
        </label>
        <div class="form-actions">
          <Button type="button" label="Annuler" severity="secondary" outlined @click="dialogOpen = false" />
          <Button type="submit" label="Enregistrer" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="lightboxOpen"
      modal
      :header="lightbox?.description || 'Aperçu'"
      :style="{ width: 'min(860px, 96vw)' }"
      :draggable="false"
      class="lightbox-dialog"
    >
      <img
        v-if="lightbox"
        :src="imageUrl(lightbox.picture)"
        :alt="lightbox.description || 'Photo'"
        class="lightbox-img"
      />
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { adminApi, imageUrl } from '@/services/adminApi';

type PictureRow = { id: number; description: string; picture: string };

const toast = useToast();
const confirm = useConfirm();

const pictures = ref<PictureRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const dialogOpen = ref(false);
const lightboxOpen = ref(false);
const lightbox = ref<PictureRow | null>(null);
const editingId = ref<number | null>(null);
const imageFile = ref<File | null>(null);
const form = reactive({ description: '' });

const load = async () => {
  loading.value = true;
  try {
    const { data } = await adminApi.listPictures();
    pictures.value = data.pictures;
  } catch {
    toast.add({ severity: 'error', summary: 'Chargement impossible', detail: 'La galerie n’a pas pu être récupérée.', life: 3500 });
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingId.value = null;
  form.description = '';
  imageFile.value = null;
  dialogOpen.value = true;
};

const openEdit = (p: PictureRow) => {
  editingId.value = p.id;
  form.description = p.description || '';
  imageFile.value = null;
  dialogOpen.value = true;
};

const openLightbox = (p: PictureRow) => {
  lightbox.value = p;
  lightboxOpen.value = true;
};

const onFile = (e: Event) => {
  imageFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
};

const save = async () => {
  if (!editingId.value && !imageFile.value) {
    toast.add({ severity: 'warn', summary: 'Image requise', life: 2800 });
    return;
  }
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append('description', form.description);
    if (imageFile.value) fd.append('image', imageFile.value);
    if (editingId.value) await adminApi.updatePicture(editingId.value, fd);
    else await adminApi.createPicture(fd);
    dialogOpen.value = false;
    toast.add({ severity: 'success', summary: 'Image enregistrée', life: 2200 });
    await load();
  } catch {
    toast.add({ severity: 'error', summary: 'Enregistrement impossible', life: 3200 });
  } finally {
    saving.value = false;
  }
};

const remove = (p: PictureRow) => {
  confirm.require({
    message: 'Supprimer définitivement cette image de la galerie ?',
    header: 'Suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer',
    rejectLabel: 'Annuler',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await adminApi.deletePicture(p.id);
        toast.add({ severity: 'success', summary: 'Image supprimée', life: 2200 });
        await load();
      } catch {
        toast.add({ severity: 'error', summary: 'Suppression impossible', life: 3000 });
      }
    },
  });
};

onMounted(load);
</script>

<style scoped>
.loading-veil {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--adm-muted, #6e675f);
  padding: 24px 0;
}
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.card {
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 50px rgba(45, 42, 38, 0.1);
}
.media {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  cursor: zoom-in;
  background: #f3e8e0;
  aspect-ratio: 1;
  overflow: hidden;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.card:hover .media img { transform: scale(1.05); }
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(42, 38, 34, 0.48);
  opacity: 0;
  transition: opacity 0.25s ease;
  cursor: default;
}
.card:hover .overlay { opacity: 1; }
.caption {
  margin: 0;
  padding: 12px 14px;
  font-size: 0.84rem;
  color: var(--adm-muted, #6e675f);
  min-height: 2.6rem;
  line-height: 1.35;
}
.empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--adm-muted, #6e675f);
}
.empty i { font-size: 1.8rem; color: #c17f59; }
.form { display: flex; flex-direction: column; gap: 14px; }
.form label { display: flex; flex-direction: column; gap: 6px; }
.form label > span { font-size: 0.78rem; color: var(--adm-muted, #6e675f); font-weight: 600; }
.file-input {
  border: 1px dashed var(--adm-border, #e6dfd6);
  border-radius: 10px;
  padding: 12px;
  background: #faf7f4;
  font: inherit;
  font-size: 0.85rem;
}
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.lightbox-img {
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 12px;
  display: block;
  background: #1a1714;
}
.w-full { width: 100%; }
@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .overlay {
    opacity: 1;
    background: linear-gradient(transparent 40%, rgba(42, 38, 34, 0.72));
    align-items: flex-end;
    padding-bottom: 10px;
  }
  .caption { padding: 8px 10px; font-size: 0.75rem; min-height: 2.2rem; }
}
</style>
