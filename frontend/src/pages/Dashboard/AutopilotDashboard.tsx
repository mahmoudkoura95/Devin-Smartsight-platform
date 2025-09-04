import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserModels, useMarketingData } from '../../hooks/api';
import { Upload, Brain, BarChart3, TrendingUp } from 'lucide-react';

export const AutopilotDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: models } = useUserModels();
  const { data: marketingData } = useMarketingData();

  const hasData = marketingData?.data && marketingData.data.length > 0;
  const hasModels = models?.data && models.data.length > 0;
  const completedModels = models?.data?.filter(m => m.status === 'completed') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Autopilot Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Your simplified MMM workflow - we'll guide you through each step
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Uploaded</p>
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
                <p className="text-sm font-medium text-gray-600">Models Trained</p>
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
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Insights Ready</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedModels.length > 0 ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ROI Improvement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedModels.length > 0 ? '+15%' : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasData && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">Step 1: Upload Your Data</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Start by uploading your marketing data to begin analysis
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/app/data/upload')}
                >
                  Upload Data
                </Button>
              </div>
            )}
            
            {hasData && !hasModels && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Step 2: Train Your Models</h3>
                <p className="text-sm text-green-700 mt-1">
                  Great! Now let's train MMM models on your data
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/app/training/select')}
                >
                  Train Models
                </Button>
              </div>
            )}
            
            {completedModels.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900">Step 3: View Your Results</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Your models are ready! View attribution insights
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate(`/app/analytics/attribution/${completedModels[0].id}`)}
                >
                  View Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {models?.data && models.data.length > 0 ? (
              <div className="space-y-3">
                {models.data.slice(0, 5).map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{model.name}</p>
                      <p className="text-sm text-gray-600">{model.model_type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      model.status === 'completed' ? 'bg-green-100 text-green-800' :
                      model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No models trained yet. Upload data to get started!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
