import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUserModels } from '../../hooks/api';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

export const ScenarioPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [scenarios, setScenarios] = useState([
    { name: 'Current Budget', facebook: 10000, google: 15000, email: 5000 },
    { name: 'Increased Facebook', facebook: 15000, google: 15000, email: 5000 },
    { name: 'Increased Google', facebook: 10000, google: 20000, email: 5000 },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { data: models } = useUserModels();
  const completedModels = models?.data?.filter(m => m.status === 'completed') || [];

  const handleAnalyzeScenarios = async () => {
    if (!selectedModel) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const updateScenario = (index: number, channel: string, value: number) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], [channel]: value };
    setScenarios(newScenarios);
  };

  const addScenario = () => {
    setScenarios([
      ...scenarios,
      { name: `Scenario ${scenarios.length + 1}`, facebook: 10000, google: 15000, email: 5000 }
    ]);
  };

  const mockPredictions = scenarios.map((scenario, index) => ({
    ...scenario,
    predictedRevenue: (scenario.facebook * 2.5 + scenario.google * 3.2 + scenario.email * 1.8) + Math.random() * 10000,
    totalSpend: scenario.facebook + scenario.google + scenario.email,
    roi: ((scenario.facebook * 2.5 + scenario.google * 3.2 + scenario.email * 1.8) / (scenario.facebook + scenario.google + scenario.email)) * 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scenario Planning</h1>
        <p className="text-gray-600 mt-2">
          Test different budget allocations and predict their impact on revenue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Choose a model for predictions
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a model...</option>
                {completedModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.model_type})
                  </option>
                ))}
              </select>
              
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={handleAnalyzeScenarios}
                disabled={!selectedModel || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Scenarios'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Budget Scenarios</CardTitle>
              <Button variant="outline" size="sm" onClick={addScenario}>
                Add Scenario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scenario Name
                      </label>
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={(e) => updateScenario(index, 'name', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook ($)
                      </label>
                      <input
                        type="number"
                        value={scenario.facebook}
                        onChange={(e) => updateScenario(index, 'facebook', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google ($)
                      </label>
                      <input
                        type="number"
                        value={scenario.google}
                        onChange={(e) => updateScenario(index, 'google', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email ($)
                      </label>
                      <input
                        type="number"
                        value={scenario.email}
                        onChange={(e) => updateScenario(index, 'email', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedModel && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPredictions.map((prediction, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">{prediction.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Predicted Revenue</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${prediction.predictedRevenue.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Total Spend</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${prediction.totalSpend.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">ROI</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {prediction.roi.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Facebook: ${prediction.facebook.toLocaleString()}</div>
                      <div>Google: ${prediction.google.toLocaleString()}</div>
                      <div>Email: ${prediction.email.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
