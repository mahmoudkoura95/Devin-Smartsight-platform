export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface MMMModel {
  id: string;
  name: string;
  model_type: string;
  status: 'training' | 'completed' | 'failed';
  created_at: string;
  training_progress?: number;
}

export interface AttributionData {
  channels: Array<{
    channel: string;
    attribution: number;
    confidence_interval?: [number, number];
  }>;
}

export interface ModelResult {
  attribution: Record<string, number>;
  metrics: {
    r_squared: number;
    mape: number;
    nrmse: number;
  };
  feature_importance: Record<string, number>;
}

export interface TrainingTask {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  models: Array<{
    type: string;
    status: string;
    progress: number;
  }>;
}

export interface Scenario {
  [channel: string]: number;
}

export interface ScenarioPrediction {
  predicted_revenue: number;
  media_spend: Record<string, number>;
  total_spend: number;
}

export interface MarketingData {
  id: string;
  source: string;
  date: string;
  channel: string;
  campaign_name?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  user_id: string;
  created_at: string;
}

export interface MarketingDataSummary {
  total_records: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  channels: string[];
  total_spend: number;
  total_revenue: number;
}

export interface ChannelInfo {
  name: string;
  default_spend_range: [number, number];
  category: string;
}

export interface CustomDataGenerationParams {
  channels: string[];
  spend_ranges: Record<string, [number, number]>;
  start_date: string;
  end_date: string;
  business_size: 'small' | 'medium' | 'large';
}

export interface SyntheticDataConfig {
  selectedChannels: string[];
  spendRanges: Record<string, [number, number]>;
  startDate: string;
  endDate: string;
  businessSize: 'small' | 'medium' | 'large';
  seasonalAdjustments: boolean;
  dayOfWeekPatterns: boolean;
}

export interface BudgetPreset {
  name: string;
  description: string;
  total_monthly_range: [number, number];
  channel_multipliers: Record<string, number>;
}

export interface DatePreset {
  days: number;
  name: string;
}

export interface PresetResponse {
  presets: Record<string, BudgetPreset>;
  date_presets: Record<string, DatePreset>;
}

export interface DataGenerationPreview {
  estimatedRecords: number;
  totalBudget: number;
  channelDistribution: Record<string, number>;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

export interface EnhancedDataSummary extends MarketingDataSummary {
  platformPerformance: Array<{
    channel: string;
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  dailyTrends: Array<{
    date: string;
    spend: number;
    revenue: number;
  }>;
  qualityScore: number;
}

export interface ModelComparison {
  overall_agreement_score: number;
  channel_agreements: Record<string, {
    mean_attribution: number;
    variance: number;
  }>;
  interpretation: 'high' | 'medium' | 'low';
}

export interface AvailableModel {
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  training_time: 'fast' | 'medium' | 'slow';
  status: 'implemented' | 'not_implemented';
}
