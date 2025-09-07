import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Download,
  CheckCircle,
  Zap
} from 'lucide-react';
import { 
  SyntheticDataConfig, 
  ChannelInfo, 
  BudgetPreset, 
  DatePreset,
  DataGenerationPreview 
} from '../types';

interface SyntheticDataWizardProps {
  config: SyntheticDataConfig;
  setConfig: (config: SyntheticDataConfig) => void;
  channels: Record<string, ChannelInfo>;
  presets: Record<string, BudgetPreset>;
  datePresets: Record<string, DatePreset>;
  onGenerateData: () => void;
  onApplyPreset: (presetName: string) => void;
  isGenerating: boolean;
  hasData: boolean;
  onExport: (format: string) => void;
  isExporting: boolean;
}

export const SyntheticDataWizard: React.FC<SyntheticDataWizardProps> = ({
  config,
  setConfig,
  channels,
  presets,
  datePresets,
  onGenerateData,
  onApplyPreset,
  isGenerating,
  hasData,
  onExport,
  isExporting
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preview, setPreview] = useState<DataGenerationPreview | null>(null);

  const steps = [
    { id: 'platforms', title: 'Select Platforms', icon: Settings },
    { id: 'budget', title: 'Set Budget', icon: DollarSign },
    { id: 'timeframe', title: 'Choose Timeframe', icon: Calendar },
    { id: 'preview', title: 'Preview & Generate', icon: BarChart3 }
  ];

  const channelsByCategory = Object.entries(channels).reduce((acc, [key, info]) => {
    const category = (info as any).category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...(info as any) });
    return acc;
  }, {} as Record<string, any[]>);

  const categoryNames = {
    paid_social: 'Paid Social',
    search_display: 'Search & Display',
    organic_email: 'Organic & Email',
    partnerships: 'Partnerships'
  };

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

  const handleSelectAll = (category: string) => {
    const categoryChannels = channelsByCategory[category]?.map(ch => ch.key) || [];
    const newChannels = [...new Set([...config.selectedChannels, ...categoryChannels])];
    const newSpendRanges = { ...config.spendRanges };
    
    categoryChannels.forEach(channelKey => {
      if (channels[channelKey] && !newSpendRanges[channelKey]) {
        newSpendRanges[channelKey] = channels[channelKey].default_spend_range;
      }
    });

    setConfig({
      ...config,
      selectedChannels: newChannels,
      spendRanges: newSpendRanges
    });
  };

  const handleSelectNone = (category: string) => {
    const categoryChannels = channelsByCategory[category]?.map(ch => ch.key) || [];
    const newChannels = config.selectedChannels.filter(ch => !categoryChannels.includes(ch));
    const newSpendRanges = { ...config.spendRanges };
    
    categoryChannels.forEach(channelKey => {
      delete newSpendRanges[channelKey];
    });

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

  const handlePresetApply = (presetName: string) => {
    onApplyPreset(presetName);
    setConfig({ ...config, businessSize: presetName as any });
  };

  const handleDatePresetApply = (presetKey: string) => {
    const preset = datePresets[presetKey];
    if (preset) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - preset.days);
      
      setConfig({
        ...config,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    }
  };

  const calculatePreview = () => {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const totalBudget = Object.values(config.spendRanges).reduce((sum: number, range: any) => {
      return sum + ((range[0] + range[1]) / 2) * days;
    }, 0);

    const channelDistribution = Object.entries(config.spendRanges).reduce((acc, [channel, range]) => {
      acc[channel] = (((range as any)[0] + (range as any)[1]) / 2) * days;
      return acc;
    }, {} as Record<string, number>);

    const estimatedRecords = config.selectedChannels.length * days * 1.5; // Average campaigns per channel

    setPreview({
      estimatedRecords: Math.round(estimatedRecords),
      totalBudget,
      channelDistribution,
      dateRange: {
        start: config.startDate,
        end: config.endDate,
        days
      }
    });
  };

  useEffect(() => {
    if (currentStep === 3) {
      calculatePreview();
    }
  }, [currentStep, config]);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return config.selectedChannels.length > 0;
      case 1: return Object.keys(config.spendRanges).length > 0;
      case 2: return config.startDate && config.endDate;
      case 3: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Select Marketing Platforms</h3>
              <p className="text-gray-600">Choose the channels you want to include in your synthetic data</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      {categoryNames[category as keyof typeof categoryNames] || category}
                    </h4>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(category)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectNone(category)}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryChannels.map((channel) => (
                      <div
                        key={channel.key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          config.selectedChannels.includes(channel.key)
                            ? 'border-blue-500 bg-blue-50'
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
                            className="w-4 h-4 text-blue-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                {config.selectedChannels.length} platforms selected
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Configure Spend Levels</h3>
              <p className="text-gray-600">Set daily spend ranges for each selected platform</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetApply(key)}
                  className="p-4 text-left border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{(preset as any).name}</div>
                  <div className="text-sm text-gray-600 mt-1">{(preset as any).description}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    ${(preset as any).total_monthly_range[0].toLocaleString()}-${(preset as any).total_monthly_range[1].toLocaleString()}/month
                  </div>
                </button>
              ))}
            </div>

            {config.selectedChannels.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Daily Spend Ranges</h4>
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
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Choose Time Period</h3>
              <p className="text-gray-600">Select the date range for your synthetic data</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(datePresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleDatePresetApply(key)}
                  className="p-3 text-center border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{(preset as any).name}</div>
                  <div className="text-sm text-gray-600">{(preset as any).days} days</div>
                </button>
              ))}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.seasonalAdjustments}
                  onChange={(e) => setConfig({ ...config, seasonalAdjustments: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Apply seasonal adjustments (holiday spikes, summer dips)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.dayOfWeekPatterns}
                  onChange={(e) => setConfig({ ...config, dayOfWeekPatterns: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Apply day-of-week patterns (B2B vs B2C spending)</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Preview & Generate</h3>
              <p className="text-gray-600">Review your configuration and generate synthetic data</p>
            </div>

            {preview && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Estimated Records</p>
                  <p className="text-2xl font-bold text-blue-900">{preview.estimatedRecords.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Total Budget</p>
                  <p className="text-2xl font-bold text-green-900">${Math.round(preview.totalBudget).toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Date Range</p>
                  <p className="text-lg font-bold text-purple-900">{preview.dateRange.days} days</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600">Platforms</p>
                  <p className="text-2xl font-bold text-orange-900">{config.selectedChannels.length}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Configuration Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Platforms:</strong> {config.selectedChannels.join(', ')}</p>
                <p><strong>Date Range:</strong> {config.startDate} to {config.endDate}</p>
                <p><strong>Seasonal Adjustments:</strong> {config.seasonalAdjustments ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Day-of-Week Patterns:</strong> {config.dayOfWeekPatterns ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onGenerateData}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating Data...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Synthetic Data
                </>
              )}
            </Button>

            {hasData && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Export Generated Data</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('csv')}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('excel')}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('json')}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generate Custom Synthetic Data</CardTitle>
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1 || !canProceed()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
