import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAvailableModels, useTrainModels } from '../../hooks/api';
import { useUser } from '../../contexts/UserContext';
import { Brain, Clock, Zap, CheckCircle } from 'lucide-react';

export const ModelSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useUser();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { data: availableModels, isLoading } = useAvailableModels();
  const trainMutation = useTrainModels();

  const handleModelToggle = (modelType: string) => {
    setSelectedModels(prev => 
      prev.includes(modelType)
        ? prev.filter(m => m !== modelType)
        : [...prev, modelType]
    );
  };

  const handleTraining = async () => {
    if (selectedModels.length === 0) return;

    try {
      const response = await trainMutation.mutateAsync({
        model_types: selectedModels,
        config: {
          hyperparameters: {},
          training_config: {
            max_iterations: 1000,
            convergence_threshold: 0.001,
          },
        },
      });

      if (response.data.task_id) {
        navigate(`/app/training/progress/${response.data.task_id}`);
      }
    } catch (error) {
      console.error('Training failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const models = availableModels?.data || {};
  const implementedModels = Object.entries(models).filter(([_, model]: [string, any]) => model.status === 'implemented');

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'low': return <Zap className="w-5 h-5 text-green-500" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'high': return <Brain className="w-5 h-5 text-red-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Model Training</h1>
        <p className="text-gray-600 mt-2">
          {mode === 'autopilot' 
            ? 'Select models to train automatically with optimized settings'
            : 'Choose and configure MMM models for training'
          }
        </p>
      </div>

      {mode === 'autopilot' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Autopilot Recommendation</p>
                <p className="text-sm text-blue-700">
                  We recommend training LightweightMMM and Ridge Regression for quick, reliable results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {implementedModels.map(([modelType, model]: [string, any]) => (
          <Card 
            key={modelType}
            className={`cursor-pointer transition-all ${
              selectedModels.includes(modelType)
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleModelToggle(modelType)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                {selectedModels.includes(modelType) && (
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{model.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Complexity</span>
                  <div className="flex items-center space-x-1">
                    {getComplexityIcon(model.complexity)}
                    <span className="text-sm capitalize">{model.complexity}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Training Time</span>
                  <span className="text-sm capitalize">{model.training_time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedModels.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedModels.join(', ')}
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleTraining}
                disabled={trainMutation.isPending}
              >
                {trainMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Starting Training...
                  </>
                ) : (
                  'Start Training'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
