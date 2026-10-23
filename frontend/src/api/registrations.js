import { client } from './auth.js';

export const registrationsApi = {
  registerForEvent: async (eventId) => {
    const response = await client.post(`/events/${eventId}/register`);
    return response.data;
  },
  cancelRegistration: async (eventId) => {
    const response = await client.delete(`/events/${eventId}/register`);
    return response.data;
  },
  getMyRegistrations: async () => {
    const response = await client.get('/me/registrations');
    return response.data;
  },
  getEventAttendees: async (eventId) => {
    const response = await client.get(`/events/${eventId}/attendees`);
    return response.data;
  },
  exportEventAttendees: async (eventId, format = 'xlsx') => {
    const response = await client.get(`/events/${eventId}/export`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob',
    });
    return response.data;
  },
};

export default registrationsApi;
