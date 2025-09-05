import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi, marketingDataApi, authApi } from '../../services/api';
import { CustomDataGenerationParams } from '../../types';

export const useAvailableModels = () => {
  return useQuery({
    queryKey: ['models', 'available'],
    queryFn: () => modelsApi.getAvailableModels(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserModels = () => {
  return useQuery({
    queryKey: ['models', 'user'],
    queryFn: () => modelsApi.getUserModels(),
  });
};

export const useModelResults = (modelId: string) => {
  return useQuery({
    queryKey: ['models', modelId, 'results'],
    queryFn: () => modelsApi.getModelResults(modelId),
    enabled: !!modelId,
  });
};

export const useTaskStatus = (taskId: string, options?: any) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => modelsApi.getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: 2000,
    ...options,
  });
};

export const useTrainModels = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modelsApi.trainModels,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUploadMarketingData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketingDataApi.uploadData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-data'] });
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token);
    },
  });
};

export const useModelComparison = (modelIds: string[]) => {
  return useQuery({
    queryKey: ['models', 'comparison', modelIds],
    queryFn: () => modelsApi.compareModels({ 
      model_ids: modelIds, 
      comparison_name: `Comparison_${Date.now()}` 
    }),
    enabled: modelIds.length >= 2,
  });
};

export const useCreateEnsemble = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modelsApi.createEnsemble,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useMarketingData = () => {
  return useQuery({
    queryKey: ['marketing-data'],
    queryFn: () => marketingDataApi.getMarketingData(),
  });
};

export const useGenerateDemoData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (days: number = 90) => marketingDataApi.generateDemoData(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-data'] });
    },
  });
};

export const useChannelInfo = () => {
  return useQuery({
    queryKey: ['channel-info'],
    queryFn: () => marketingDataApi.getChannelInfo(),
  });
};

export const useGenerateCustomData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CustomDataGenerationParams) => marketingDataApi.generateCustomData(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-data'] });
    },
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: (format: string) => marketingDataApi.exportData(format),
  });
};
