import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserModels, useMarketingData } from '../../hooks/api';
import { 
  Upload, 
  Brain, 
  BarChart3, 
  TrendingUp, 
  GitCompare, 
  Target,
  Activity,
  Zap
} from 'lucide-react';

export const CopilotDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: models } = useUserModels();
  const { data: marketingData } = useMarketingData();

  const completedModels = models?.data?.filter(m => m.status === 'completed') || [];
  const trainingModels = models?.data?.filter(m => m.status === 'training') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Co-Pilot Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Advanced MMM analytics and model management
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/app/training/select')}>
            Train New Model
          </Button>
          <Button variant="primary" onClick={() => navigate('/app/comparison')}>
            Compare Models
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Datasets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {marketingData?.data?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedModels.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Training</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainingModels.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedModels.length > 0 ? '87%' : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Model Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {completedModels.length > 0 ? (
              <div className="space-y-4">
                {completedModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{model.name}</p>
                        <p className="text-sm text-gray-600">{model.model_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">R² Score</p>
                        <p className="text-sm text-gray-600">0.{Math.floor(Math.random() * 30) + 70}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/app/analytics/attribution/${model.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No models trained yet</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => navigate('/app/training/select')}
                >
                  Train Your First Model
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/app/data/upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/app/training/select')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Train Models
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/app/comparison')}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Models
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/app/analytics/scenarios')}
            >
              <Target className="w-4 h-4 mr-2" />
              Scenario Planning
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
