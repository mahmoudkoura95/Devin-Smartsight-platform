import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUserModels, useModelComparison } from '../../hooks/api';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { data: models, isLoading: modelsLoading } = useUserModels();
  const { data: comparison, isLoading: comparisonLoading } = useModelComparison(selectedModels);

  const completedModels = models?.data?.filter(m => m.status === 'completed') || [];

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : prev.length < 3 ? [...prev, modelId] : prev
    );
  };

  const getAgreementIcon = (agreement: number) => {
    if (agreement > 0.8) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (agreement > 0.6) return <Minus className="w-5 h-5 text-yellow-500" />;
    return <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  const getAgreementColor = (agreement: number) => {
    if (agreement > 0.8) return 'text-green-600';
    if (agreement > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Model Comparison</h1>
        <p className="text-gray-600 mt-2">
          Compare attribution results across multiple MMM models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Models to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            {completedModels.length > 0 ? (
              <div className="space-y-3">
                {completedModels.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModels.includes(model.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleModelToggle(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{model.name}</p>
                        <p className="text-sm text-gray-600">{model.model_type}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={() => handleModelToggle(model.id)}
                        className="w-4 h-4 text-primary-600"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Select 2-3 models to compare (max 3)
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed models available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Train some models first to enable comparison
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedModels.length < 2 ? (
              <div className="text-center py-12">
                <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select at least 2 models to compare</p>
              </div>
            ) : comparisonLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Analyzing model agreement...</span>
              </div>
            ) : comparison?.data ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getAgreementIcon(comparison.data.overall_agreement_score)}
                    <span className={`text-2xl font-bold ${getAgreementColor(comparison.data.overall_agreement_score)}`}>
                      {(comparison.data.overall_agreement_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-600">Overall Model Agreement</p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">
                    {comparison.data.interpretation} agreement
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Channel Attribution Agreement</h3>
                  <div className="space-y-3">
                    {Object.entries(comparison.data.channel_agreements).map(([channel, data]: [string, any]) => (
                      <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{channel}</p>
                          <p className="text-sm text-gray-600">
                            Mean Attribution: {(data.mean_attribution * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Variance: {(data.variance * 100).toFixed(2)}%
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            {getAgreementIcon(1 - data.variance)}
                            <span className={`text-sm ${getAgreementColor(1 - data.variance)}`}>
                              {data.variance < 0.1 ? 'High' : data.variance < 0.2 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No comparison data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
