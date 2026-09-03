import axiosInstance from '@/services/api';

const IMAGE_BASE = 'https://backoffice.atelier-de-marie.com/images/service/';


export function imageUrl(filename?: string | null): string {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  return IMAGE_BASE + filename;
}

export const adminApi = {
  // Dashboard / stats
  getDashboard: () => axiosInstance.get('admin/dashboard'),
  getStatistics: (params: Record<string, string>) => axiosInstance.get('admin/statistics', { params }),

  // Services
  listServices: () => axiosInstance.get('admin/services'),
  createService: (formData: FormData) => axiosInstance.post('admin/services', formData),
  updateService: (id: number, formData: FormData) => axiosInstance.post(`admin/services/${id}`, formData),
  deleteService: (id: number) => axiosInstance.delete(`admin/services/${id}`),

  // Categories
  listCategories: () => axiosInstance.get('admin/categories'),
  createCategory: (formData: FormData) => axiosInstance.post('admin/categories', formData),
  updateCategory: (id: number, formData: FormData) => axiosInstance.post(`admin/categories/${id}`, formData),
  deleteCategory: (id: number) => axiosInstance.delete(`admin/categories/${id}`),

  // Pictures
  listPictures: () => axiosInstance.get('admin/pictures'),
  createPicture: (formData: FormData) => axiosInstance.post('admin/pictures', formData),
  updatePicture: (id: number, formData: FormData) => axiosInstance.post(`admin/pictures/${id}`, formData),
  deletePicture: (id: number) => axiosInstance.delete(`admin/pictures/${id}`),

  // Clients
  listClients: (search = '') => axiosInstance.get('admin/clients', { params: { search } }),
  getClient: (id: number) => axiosInstance.get(`admin/clients/${id}`),
  createClient: (payload: Record<string, unknown>) => axiosInstance.post('admin/clients', payload),
  updateClient: (id: number, payload: Record<string, unknown>) => axiosInstance.put(`admin/clients/${id}`, payload),
  deleteClient: (id: number) => axiosInstance.delete(`admin/clients/${id}`),

  // Appointments
  listAppointments: () => axiosInstance.get('admin/appointments'),
  appointmentsMeta: () => axiosInstance.get('admin/appointments/meta'),
  createAppointment: (payload: Record<string, unknown>) => axiosInstance.post('admin/appointments', payload),
  updateAppointment: (id: number, payload: Record<string, unknown>) => axiosInstance.put(`admin/appointments/${id}`, payload),
  deleteAppointment: (id: number) => axiosInstance.delete(`admin/appointments/${id}`),
};
