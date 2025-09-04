import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useModelResults } from '../../hooks/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const AttributionPage: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const { data: modelResults, isLoading } = useModelResults(modelId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!modelResults?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No attribution data available</p>
      </div>
    );
  }

  const results = modelResults.data;
  
  const attributionData = Object.entries(results.attribution).map(([channel, value]: [string, any]) => ({
    channel: channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    attribution: value,
    percentage: (value * 100).toFixed(1),
  }));

  const featureImportanceData = Object.entries(results.feature_importance).map(([feature, importance]: [string, any]) => ({
    feature: feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    importance: importance,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attribution Analysis</h1>
        <p className="text-gray-600 mt-2">
          Channel attribution and feature importance insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">R² Score</span>
                <span className="font-medium">{results.metrics.r_squared.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MAPE</span>
                <span className="font-medium">{(results.metrics.mape * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NRMSE</span>
                <span className="font-medium">{(results.metrics.nrmse * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Channel Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Attribution']}
                />
                <Bar dataKey="attribution" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ channel, percentage }) => `${channel}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="attribution"
                >
                  {attributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Attribution']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureImportanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="importance" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attributionData.map((item, index) => (
              <div key={item.channel} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.channel}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
