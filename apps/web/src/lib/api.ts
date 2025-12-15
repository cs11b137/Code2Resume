import axios from 'axios';
import type {
  FetchMaterialRequestBody,
  FetchMaterialResponseBody,
  GenerateRequestBody,
  GenerateResponseBody,
} from '../types/api';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787',
  timeout: 60_000,
});

export async function generate(payload: GenerateRequestBody) {
  const res = await api.post<GenerateResponseBody>('/api/generate', payload);
  return res.data;
}

export async function fetchMaterial(payload: FetchMaterialRequestBody) {
  const res = await api.post<FetchMaterialResponseBody>('/api/fetch-material', payload);
  return res.data;
}
