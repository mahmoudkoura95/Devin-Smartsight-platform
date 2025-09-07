import React, { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SyntheticDataWizard } from '../../components/SyntheticDataWizard';
import { EnhancedDataOverview } from '../../components/EnhancedDataOverview';
import { 
  useUploadMarketingData, 
  useMarketingData, 
  useGenerateDemoData,
  useChannelInfo,
  useGenerateCustomData,
  useExportData,
  usePresets,
  useApplyPreset
} from '../../hooks/api';
import { Upload, FileText, CheckCircle, AlertCircle, Zap, BarChart3, Settings, Download, Calendar, DollarSign } from 'lucide-react';
import { MarketingData, SyntheticDataConfig, EnhancedDataSummary } from '../../types';

const DataSummaryCard: React.FC<{ data: MarketingData[] }> = ({ data }) => {
  const enhancedSummary = useMemo(() => {
    if (!data || data.length === 0) return null;

    const channelSet = new Set(data.map(d => d.channel));
    const channels = Array.from(channelSet);
    
    const platformPerformance = channels.map(channel => {
      const channelData = data.filter(d => d.channel === channel);
      const spend = channelData.reduce((sum, d) => sum + (d.spend || 0), 0);
      const revenue = channelData.reduce((sum, d) => sum + (d.revenue || 0), 0);
      const impressions = channelData.reduce((sum, d) => sum + (d.impressions || 0), 0);
      const clicks = channelData.reduce((sum, d) => sum + (d.clicks || 0), 0);
      const conversions = channelData.reduce((sum, d) => sum + (d.conversions || 0), 0);
      
      return {
        channel,
        spend,
        revenue,
        roas: spend > 0 ? revenue / spend : 0,
        impressions,
        clicks,
        conversions
      };
    });

    const dailyTrends = Object.entries(
      data.reduce((acc, d) => {
        const date = d.date;
        if (!acc[date]) acc[date] = { spend: 0, revenue: 0 };
        acc[date].spend += d.spend || 0;
        acc[date].revenue += d.revenue || 0;
        return acc;
      }, {} as Record<string, { spend: number; revenue: number }>)
    ).map(([date, values]) => ({ date, ...values }));

    const totalSpend = data.reduce((sum, d) => sum + (d.spend || 0), 0);
    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalImpressions = data.reduce((sum, d) => sum + (d.impressions || 0), 0);
    const totalClicks = data.reduce((sum, d) => sum + (d.clicks || 0), 0);
    
    let qualityScore = 85; // Base score
    
    const avgCTR = totalClicks / totalImpressions;
    if (avgCTR >= 0.01 && avgCTR <= 0.1) qualityScore += 5;
    
    const avgROAS = totalRevenue / totalSpend;
    if (avgROAS >= 1.5 && avgROAS <= 8) qualityScore += 5;
    
    if (data.every(d => d.spend && d.impressions && d.clicks)) qualityScore += 5;

    return {
      total_records: data.length,
      channels,
      total_spend: totalSpend,
      total_revenue: totalRevenue,
      date_range: {
        start_date: new Date(Math.min(...data.map(d => new Date(d.date).getTime()))).toISOString(),
        end_date: new Date(Math.max(...data.map(d => new Date(d.date).getTime()))).toISOString(),
      },
      platformPerformance,
      dailyTrends,
      qualityScore: Math.min(100, qualityScore)
    } as EnhancedDataSummary;
  }, [data]);

  if (!enhancedSummary) {
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

  return <EnhancedDataOverview summary={enhancedSummary} />;
};

const SyntheticDataGenerator: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<SyntheticDataConfig>({
    selectedChannels: [],
    spendRanges: {},
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    businessSize: 'medium',
    seasonalAdjustments: true,
    dayOfWeekPatterns: true
  });

  const { data: channelInfo } = useChannelInfo();
  const { data: presetsData } = usePresets();
  const generateCustomMutation = useGenerateCustomData();
  const generateDemoMutation = useGenerateDemoData();
  const exportMutation = useExportData();
  const applyPresetMutation = useApplyPreset();
  const { data: marketingData } = useMarketingData();

  const channels = channelInfo?.data?.channels || {};
  const presets = presetsData?.data?.presets || {};
  const datePresets = presetsData?.data?.date_presets || {};

  const handleGenerateCustomData = () => {
    generateCustomMutation.mutate({
      channels: config.selectedChannels,
      spend_ranges: config.spendRanges,
      start_date: config.startDate,
      end_date: config.endDate,
      business_size: config.businessSize
    });
  };

  const handleApplyPreset = async (presetName: string) => {
    try {
      const response = await applyPresetMutation.mutateAsync({
        presetName,
        channels: config.selectedChannels
      });
      setConfig({
        ...config,
        spendRanges: response.data.spend_ranges
      });
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
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

  return (
    <>
      {!showAdvanced ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generate Demo Data</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>
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
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Data Generation</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Simple Mode
            </Button>
          </div>
          
          <SyntheticDataWizard
            config={config}
            setConfig={setConfig}
            channels={channels}
            presets={presets}
            datePresets={datePresets}
            onGenerateData={handleGenerateCustomData}
            onApplyPreset={handleApplyPreset}
            isGenerating={generateCustomMutation.isPending}
            hasData={marketingData?.data && marketingData.data.length > 0}
            onExport={handleExport}
            isExporting={exportMutation.isPending}
          />
        </div>
      )}
    </>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
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

        <div className="lg:col-span-3">
          <SyntheticDataGenerator />
        </div>
      </div>

      {marketingData?.data && marketingData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Overview & Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <DataSummaryCard data={marketingData.data} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
