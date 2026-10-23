import { client } from './auth.js';

export const eventsApi = {
  getEvents: async (params = {}) => {
    const response = await client.get('/events', { params });
    return response.data;
  },
  getEventById: async (id) => {
    const response = await client.get(`/events/${id}`);
    return response.data;
  },
  createEvent: async (eventData) => {
    const response = await client.post('/events', eventData);
    return response.data;
  },
  updateEvent: async (id, eventData) => {
    const response = await client.put(`/events/${id}`, eventData);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await client.delete(`/events/${id}`);
    return response.data;
  },
  getDepartments: async () => {
    const response = await client.get('/departments');
    return response.data;
  },
  getCategories: async () => {
    const response = await client.get('/categories');
    return response.data;
  },
};

export default eventsApi;
