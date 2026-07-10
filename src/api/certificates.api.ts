import { api } from '../lib/axios';
import type { Certificate, RequestCertificateResponse } from '../types/entities.types';

export const certificatesApi = {
  request: (olympiadId: string) =>
    api
      .post<RequestCertificateResponse>(`/certificates/request/${olympiadId}`)
      .then((res) => res.data),

  list: () => api.get<Certificate[]>('/certificates').then((res) => res.data),

  // Streams the PDF via the backend's Nginx X-Accel-Redirect, saved as a
  // normal browser download instead of navigating away from the SPA.
  download: async (id: string) => {
    const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
