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
