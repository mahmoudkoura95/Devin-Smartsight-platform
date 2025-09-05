import axios from 'axios';
import { User, MMMModel, ModelResult, TrainingTask, ScenarioPrediction, MarketingData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: (userData: { email: string; password: string; full_name: string }) =>
    apiClient.post('/auth/register', userData),
  testToken: () => apiClient.post('/auth/test-token'),
};

export const modelsApi = {
  getAvailableModels: () => apiClient.get('/models/available-models/info'),
  getUserModels: () => apiClient.get<MMMModel[]>('/models/'),
  getModel: (modelId: string) => apiClient.get<MMMModel>(`/models/${modelId}`),
  getModelResults: (modelId: string) => apiClient.get<ModelResult>(`/models/${modelId}/results`),
  trainModels: (data: { model_types: string[]; config: any }) =>
    apiClient.post('/models/train', data),
  trainSingleModel: (data: { model_type: string; config: any }) =>
    apiClient.post('/models/train-single', data),
  compareModels: (data: { model_ids: string[]; comparison_name: string }) =>
    apiClient.post('/models/compare', data),
  createEnsemble: (data: { model_ids: string[]; weights: Record<string, number>; ensemble_name: string }) =>
    apiClient.post('/models/ensemble', data),
  predictScenarios: (modelId: string, scenarios: any[]) =>
    apiClient.post<ScenarioPrediction>(`/models/${modelId}/predict`, { scenarios }),
  getTaskStatus: (taskId: string) => apiClient.get<TrainingTask>(`/models/task/${taskId}`),
};

export const marketingDataApi = {
  uploadData: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/marketing-data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMarketingData: () => apiClient.get<MarketingData[]>('/marketing-data/'),
  getMarketingDataById: (dataId: string) => apiClient.get<MarketingData>(`/marketing-data/${dataId}`),
  generateDemoData: (days: number = 90) => 
    apiClient.post(`/marketing-data/generate-demo-data?days=${days}`),
  getChannelInfo: () => apiClient.get('/marketing-data/channel-info'),
  generateCustomData: (params: {
    channels: string[];
    spend_ranges: Record<string, [number, number]>;
    start_date: string;
    end_date: string;
    business_size: string;
  }) => apiClient.post('/marketing-data/generate-custom-data', params),
  exportData: (format: string = 'csv') => 
    apiClient.post(`/marketing-data/export`, { format }, { responseType: 'blob' }),
};
