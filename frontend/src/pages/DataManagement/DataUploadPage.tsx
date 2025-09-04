import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUploadMarketingData, useMarketingData, useGenerateDemoData } from '../../hooks/api';
import { Upload, FileText, CheckCircle, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import { MarketingData } from '../../types';

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

        <Card>
          <CardHeader>
            <CardTitle>Generate Demo Data</CardTitle>
          </CardHeader>
          <CardContent>
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
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Google Ads, Facebook, Instagram, TikTok, YouTube</p>
                <p>• LinkedIn, Twitter, Pinterest, Email, SEO</p>
                <p>• Display Ads, Affiliate Marketing</p>
                <p>• Realistic spend, impressions, clicks, conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
