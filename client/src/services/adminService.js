import api from './api';

export const getAdminStats    = ()       => api.get('/admin/stats');
export const getAllUsers       = ()       => api.get('/admin/users');
export const addHospital      = (data)   => api.post('/admin/hospitals', data);
export const deleteHospital   = (id)     => api.delete(`/admin/hospitals/${id}`);