import api from './api';

export const getHospitals            = ()         => api.get('/hospitals');
export const getAlerts               = ()         => api.get('/hospitals/alerts');
export const getAlertCounts          = ()         => api.get('/hospitals/alert-counts');
export const getMySubscriptions      = ()         => api.get('/hospitals/my-subscriptions');
export const subscribeToHospital     = (id)       => api.post(`/hospitals/${id}/subscribe`);
export const unsubscribeFromHospital = (id)       => api.delete(`/hospitals/${id}/unsubscribe`);
export const suggestHospital         = (lat, lng) => api.post('/hospitals/suggest', { latitude: lat, longitude: lng });