import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  useUploadMarketingData, 
  useMarketingData, 
  useGenerateDemoData,
  useChannelInfo,
  useGenerateCustomData,
  useExportData
} from '../../hooks/api';
import { Upload, FileText, CheckCircle, AlertCircle, Zap, BarChart3, Settings, Download, Calendar, DollarSign } from 'lucide-react';
import { MarketingData, SyntheticDataConfig } from '../../types';

const DataSummaryCard: React.FC<{ data: MarketingData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No marketing data available</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload a file or generate demo data to get started
        </p>
      </div>
    );
  }

  const channelSet = new Set(data.map(d => d.channel));
  const channels = Array.from(channelSet);
  
  const summary = {
    total_records: data.length,
    channels: channels,
    total_spend: data.reduce((sum, d) => sum + (d.spend || 0), 0),
    total_revenue: data.reduce((sum, d) => sum + (d.revenue || 0), 0),
    date_range: {
      start_date: Math.min(...data.map(d => new Date(d.date).getTime())),
      end_date: Math.max(...data.map(d => new Date(d.date).getTime())),
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-900">{summary.total_records.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Channels</p>
          <p className="text-2xl font-bold text-green-900">{summary.channels.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Total Spend</p>
          <p className="text-2xl font-bold text-purple-900">${Math.round(summary.total_spend).toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-orange-600">Total Revenue</p>
          <p className="text-2xl font-bold text-orange-900">${Math.round(summary.total_revenue).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Date Range</p>
        <p className="font-medium">
          {new Date(summary.date_range.start_date).toLocaleDateString()} - {new Date(summary.date_range.end_date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 mt-2">Channels: {summary.channels.join(', ')}</p>
      </div>
    </div>
  );
};

const SyntheticDataGenerator: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<SyntheticDataConfig>({
    selectedChannels: [],
    spendRanges: {},
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    businessSize: 'medium'
  });

  const { data: channelInfo } = useChannelInfo();
  const generateCustomMutation = useGenerateCustomData();
  const generateDemoMutation = useGenerateDemoData();
  const exportMutation = useExportData();
  const { data: marketingData } = useMarketingData();

  const channels = channelInfo?.data?.channels || {};
  const channelsByCategory = Object.entries(channels).reduce((acc, [key, info]: [string, any]) => {
    const category = info.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...info });
    return acc;
  }, {} as Record<string, any[]>);

  const handleChannelToggle = (channelKey: string) => {
    const isSelected = config.selectedChannels.includes(channelKey);
    const newChannels = isSelected 
      ? config.selectedChannels.filter(c => c !== channelKey)
      : [...config.selectedChannels, channelKey];
    
    const newSpendRanges = { ...config.spendRanges };
    if (!isSelected && channels[channelKey]) {
      newSpendRanges[channelKey] = channels[channelKey].default_spend_range;
    } else if (isSelected) {
      delete newSpendRanges[channelKey];
    }

    setConfig({
      ...config,
      selectedChannels: newChannels,
      spendRanges: newSpendRanges
    });
  };

  const handleSpendRangeChange = (channelKey: string, index: number, value: number) => {
    const newSpendRanges = { ...config.spendRanges };
    if (!newSpendRanges[channelKey]) {
      newSpendRanges[channelKey] = channels[channelKey]?.default_spend_range || [0, 1000];
    }
    newSpendRanges[channelKey][index] = value;
    setConfig({ ...config, spendRanges: newSpendRanges });
  };

  const handleGenerateCustomData = () => {
    generateCustomMutation.mutate({
      channels: config.selectedChannels,
      spend_ranges: config.spendRanges,
      start_date: config.startDate,
      end_date: config.endDate,
      business_size: config.businessSize
    });
  };

  const handleExport = async (format: string) => {
    try {
      const response = await exportMutation.mutateAsync(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smartsight_marketing_data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const categoryNames = {
    paid_social: 'Paid Social',
    search_display: 'Search & Display',
    organic_email: 'Organic & Email',
    partnerships: 'Partnerships'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generate Demo Data</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!showAdvanced ? (
          <div className="text-center space-y-4">
            <Zap className="w-12 h-12 text-blue-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Create Realistic Marketing Data
              </p>
              <p className="text-gray-600">
                Generate 90 days of synthetic data across 12 channels
              </p>
            </div>
            
            {marketingData?.data && marketingData.data.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  {marketingData.data.length} records loaded
                </p>
                <p className="text-sm text-green-600">
                  Marketing data is ready for MMM training
                </p>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => generateDemoMutation.mutate(90)}
                disabled={generateDemoMutation.isPending}
                className="w-full"
              >
                {generateDemoMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating Data...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Demo Data
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setConfig({ ...config, businessSize: size })}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      config.businessSize === size
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{size}</div>
                    <div className="text-xs text-gray-500">
                      {size === 'small' && '$100-$1K/mo'}
                      {size === 'medium' && '$1K-$10K/mo'}
                      {size === 'large' && '$10K-$100K/mo'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Marketing Channels ({config.selectedChannels.length} selected)
              </label>
              <div className="space-y-4">
                {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {categoryNames[category as keyof typeof categoryNames] || category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryChannels.map((channel) => (
                        <div
                          key={channel.key}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            config.selectedChannels.includes(channel.key)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleChannelToggle(channel.key)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{channel.name}</p>
                              <p className="text-xs text-gray-500">
                                ${channel.default_spend_range[0]}-${channel.default_spend_range[1]}/day
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={config.selectedChannels.includes(channel.key)}
                              onChange={() => handleChannelToggle(channel.key)}
                              className="w-4 h-4 text-primary-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {config.selectedChannels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Daily Spend Ranges
                </label>
                <div className="space-y-3">
                  {config.selectedChannels.map((channelKey) => {
                    const channel = channels[channelKey];
                    const spendRange = config.spendRanges[channelKey] || channel?.default_spend_range || [0, 1000];
                    
                    return (
                      <div key={channelKey} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{channel?.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={spendRange[0]}
                            onChange={(e) => handleSpendRangeChange(channelKey, 0, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Min"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={spendRange[1]}
                            onChange={(e) => handleSpendRangeChange(channelKey, 1, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleGenerateCustomData}
              disabled={generateCustomMutation.isPending || config.selectedChannels.length === 0}
              className="w-full"
            >
              {generateCustomMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating Custom Data...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Custom Data ({config.selectedChannels.length} channels)
                </>
              )}
            </Button>
          </div>
        )}

        {marketingData?.data && marketingData.data.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                disabled={exportMutation.isPending}
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DataUploadPage: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const uploadMutation = useUploadMarketingData();
  const generateDemoMutation = useGenerateDemoData();
  const { data: marketingData, refetch } = useMarketingData();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');

    try {
      await uploadMutation.mutateAsync(file);
      setUploadStatus('success');
      refetch();
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  }, [uploadMutation, refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage your marketing data for MMM analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Marketing Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploadStatus === 'uploading' ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" className="mx-auto" />
                  <p className="text-gray-600">Uploading your data...</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-green-600 font-medium">Upload successful!</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadStatus('idle')}
                  >
                    Upload Another File
                  </Button>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <p className="text-red-600 font-medium">Upload failed</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadStatus('idle')}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your marketing data'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports CSV, XLS, XLSX files up to 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Required Columns:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Date (YYYY-MM-DD format)</li>
                <li>• Revenue or Conversions</li>
                <li>• Media spend columns (e.g., Facebook_spend, Google_spend)</li>
                <li>• Optional: External factors (seasonality, events)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <SyntheticDataGenerator />

        <Card>
          <CardHeader>
            <CardTitle>Marketing Data Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataSummaryCard data={marketingData?.data || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
