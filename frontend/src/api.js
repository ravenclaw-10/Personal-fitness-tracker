import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:4000' });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;
