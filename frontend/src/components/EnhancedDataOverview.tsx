import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Eye, MousePointer, BarChart3 } from 'lucide-react';
import { EnhancedDataSummary } from '../types';

interface EnhancedDataOverviewProps {
  summary: EnhancedDataSummary;
}

export const EnhancedDataOverview: React.FC<EnhancedDataOverviewProps> = ({ summary }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Improvement';
  };

  const topPerformingChannels = summary.platformPerformance
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5);

  const channelSpendData = summary.platformPerformance.map(channel => ({
    name: channel.channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    spend: channel.spend,
    revenue: channel.revenue,
    roas: channel.roas
  }));

  const dailyTrendsData = summary.dailyTrends.slice(-30).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spend: day.spend,
    revenue: day.revenue,
    roas: day.revenue / day.spend
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.total_records)}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_spend)}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_revenue)}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Quality</p>
                <p className="text-2xl font-bold text-gray-900">{summary.qualityScore}%</p>
                <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getQualityScoreColor(summary.qualityScore)}`}>
                  {getQualityScoreLabel(summary.qualityScore)}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelSpendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'spend' || name === 'revenue' ? formatCurrency(value as number) : (value as number).toFixed(2),
                    name === 'spend' ? 'Spend' : name === 'revenue' ? 'Revenue' : 'ROAS'
                  ]}
                />
                <Bar dataKey="spend" fill="#3B82F6" name="spend" />
                <Bar dataKey="revenue" fill="#10B981" name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'roas' ? (value as number).toFixed(2) : formatCurrency(value as number),
                    name === 'spend' ? 'Spend' : name === 'revenue' ? 'Revenue' : 'ROAS'
                  ]}
                />
                <Line type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} name="spend" />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Channels by ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingChannels.map((channel, index) => (
                <div key={channel.channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`} 
                         style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {channel.channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(channel.spend)} spend → {formatCurrency(channel.revenue)} revenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{channel.roas.toFixed(2)}x</p>
                    <p className="text-sm text-gray-600">ROAS</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelSpendData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="spend"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {channelSpendData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Platform Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Platform</th>
                  <th className="text-right p-2">Spend</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">ROAS</th>
                  <th className="text-right p-2">Impressions</th>
                  <th className="text-right p-2">Clicks</th>
                  <th className="text-right p-2">Conversions</th>
                  <th className="text-right p-2">CTR</th>
                  <th className="text-right p-2">CVR</th>
                </tr>
              </thead>
              <tbody>
                {summary.platformPerformance.map((channel) => (
                  <tr key={channel.channel} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      {channel.channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="text-right p-2">{formatCurrency(channel.spend)}</td>
                    <td className="text-right p-2">{formatCurrency(channel.revenue)}</td>
                    <td className="text-right p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        channel.roas >= 3 ? 'bg-green-100 text-green-800' :
                        channel.roas >= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {channel.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="text-right p-2">{formatNumber(channel.impressions)}</td>
                    <td className="text-right p-2">{formatNumber(channel.clicks)}</td>
                    <td className="text-right p-2">{formatNumber(channel.conversions)}</td>
                    <td className="text-right p-2">{((channel.clicks / channel.impressions) * 100).toFixed(2)}%</td>
                    <td className="text-right p-2">{((channel.conversions / channel.clicks) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
