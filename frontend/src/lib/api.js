import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function createApiClient(getToken) {
  const client = axios.create({ baseURL: API_URL });
  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

export { API_URL };
