# SmartSight Frontend Implementation Plan - Phase 3

## Overview

This document outlines the complete frontend implementation plan for Phase 3 of the SmartSight MMM Platform. The frontend will provide an intuitive interface for both SMB users (Autopilot mode) and enterprise users (Co-Pilot mode) to interact with the MMM models and analytics.

## 🎯 User Experience Strategy

### Dual-Mode Architecture

#### **Autopilot Mode (SMB Focus)**
- **Goal**: Simplified, guided experience for non-technical users
- **Features**: Automated model selection, guided data upload, simplified visualizations
- **User Journey**: Upload data → Auto-train models → View results → Get recommendations

#### **Co-Pilot Mode (Enterprise Focus)**
- **Goal**: Advanced analytics for data scientists and marketing analysts
- **Features**: Manual model configuration, ensemble creation, advanced visualizations
- **User Journey**: Configure models → Compare results → Create ensembles → Advanced analysis

## 🏗️ Component Architecture

### Core Layout Components

```typescript
// src/components/layout/
├── AppLayout.tsx              # Main application layout
├── Sidebar.tsx                # Navigation sidebar
├── Header.tsx                 # Top navigation bar
├── ModeToggle.tsx             # Autopilot/Co-Pilot mode switcher
└── Breadcrumbs.tsx            # Navigation breadcrumbs
```

### Page Components

```typescript
// src/pages/
├── Dashboard/
│   ├── DashboardPage.tsx      # Main dashboard
│   ├── AutopilotDashboard.tsx # SMB simplified dashboard
│   └── CopilotDashboard.tsx   # Enterprise advanced dashboard
├── DataManagement/
│   ├── DataUploadPage.tsx     # Data upload interface
│   ├── DataValidationPage.tsx # Data quality checks
│   └── DataPreviewPage.tsx    # Data preview and editing
├── ModelTraining/
│   ├── ModelSelectionPage.tsx # Model selection interface
│   ├── TrainingConfigPage.tsx # Model configuration
│   ├── TrainingProgressPage.tsx # Real-time training progress
│   └── TrainingResultsPage.tsx # Training completion results
├── ModelComparison/
│   ├── ComparisonPage.tsx     # Multi-model comparison
│   ├── EnsemblePage.tsx       # Ensemble creation
│   └── AgreementAnalysisPage.tsx # Model agreement analysis
├── Analytics/
│   ├── AttributionPage.tsx    # Channel attribution analysis
│   ├── ScenarioPage.tsx       # Budget scenario planning
│   ├── OptimizationPage.tsx   # Budget optimization
│   └── ReportsPage.tsx        # Export and reporting
└── Settings/
    ├── ProfilePage.tsx        # User profile
    ├── PreferencesPage.tsx    # User preferences
    └── IntegrationsPage.tsx   # API integrations
```

### Shared Components

```typescript
// src/components/shared/
├── Charts/
│   ├── AttributionChart.tsx   # Channel attribution visualization
│   ├── TimeSeriesChart.tsx    # Time series data visualization
│   ├── WaterfallChart.tsx     # Waterfall decomposition
│   ├── ScenarioChart.tsx      # Scenario comparison charts
│   └── AgreementChart.tsx     # Model agreement visualization
├── Forms/
│   ├── ModelConfigForm.tsx    # Model configuration form
│   ├── ScenarioForm.tsx       # Scenario planning form
│   ├── DataUploadForm.tsx     # Data upload form
│   └── EnsembleForm.tsx       # Ensemble creation form
├── Tables/
│   ├── ModelResultsTable.tsx # Model results table
│   ├── DataTable.tsx          # Generic data table
│   ├── ComparisonTable.tsx    # Model comparison table
│   └── ScenarioTable.tsx      # Scenario results table
├── Cards/
│   ├── ModelCard.tsx          # Individual model display
│   ├── MetricCard.tsx         # KPI metric display
│   ├── StatusCard.tsx         # Training status display
│   └── InsightCard.tsx        # AI-generated insights
├── Modals/
│   ├── ModelDetailsModal.tsx  # Model details popup
│   ├── DataPreviewModal.tsx   # Data preview popup
│   ├── ExportModal.tsx        # Export options popup
│   └── HelpModal.tsx          # Help and documentation
└── Loading/
    ├── LoadingSpinner.tsx     # Loading indicators
    ├── ProgressBar.tsx        # Progress tracking
    ├── SkeletonLoader.tsx     # Skeleton loading states
    └── TrainingProgress.tsx   # Real-time training progress
```

## 📱 Page-by-Page Implementation

### 1. Landing Page & Mode Selection

**File**: `src/pages/LandingPage.tsx`

**Features**:
- Hero section with platform overview
- Mode selection (Autopilot vs Co-Pilot)
- Feature highlights and benefits
- Getting started guide

**Components**:
```typescript
interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <HeroSection />
      <ModeSelectionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};
```

### 2. Dashboard Implementation

#### **Autopilot Dashboard**
**File**: `src/pages/Dashboard/AutopilotDashboard.tsx`

**Features**:
- Quick start wizard
- Automated insights
- Simple KPI cards
- Recommended actions

```typescript
const AutopilotDashboard: React.FC = () => {
  const { data: insights } = useAutopilotInsights();
  const { data: recommendations } = useRecommendations();

  return (
    <div className="space-y-6">
      <QuickStartWizard />
      <KPIOverview metrics={insights?.kpis} />
      <InsightsSection insights={insights?.insights} />
      <RecommendationsSection recommendations={recommendations} />
      <SimpleAttributionChart data={insights?.attribution} />
    </div>
  );
};
```

#### **Co-Pilot Dashboard**
**File**: `src/pages/Dashboard/CopilotDashboard.tsx`

**Features**:
- Advanced analytics overview
- Model performance monitoring
- Custom dashboard widgets
- Real-time training status

```typescript
const CopilotDashboard: React.FC = () => {
  const { data: models } = useUserModels();
  const { data: comparisons } = useModelComparisons();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <ModelPerformanceOverview models={models} />
        <AttributionAnalysis />
        <ScenarioPlanning />
      </div>
      <div className="col-span-4">
        <TrainingStatusPanel />
        <ModelComparisonPanel comparisons={comparisons} />
        <QuickActions />
      </div>
    </div>
  );
};
```

### 3. Data Management

#### **Data Upload Interface**
**File**: `src/pages/DataManagement/DataUploadPage.tsx`

**Features**:
- Drag-and-drop file upload
- CSV format validation
- Data preview and editing
- Column mapping interface

```typescript
const DataUploadPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { mutate: uploadData } = useUploadMarketingData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Upload Marketing Data" />
      <FileUploadZone onFileSelect={setUploadedFile} />
      {previewData.length > 0 && (
        <>
          <DataPreviewTable data={previewData} />
          <ColumnMappingForm data={previewData} onSubmit={uploadData} />
        </>
      )}
    </div>
  );
};
```

### 4. Model Training Interface

#### **Model Selection & Configuration**
**File**: `src/pages/ModelTraining/ModelSelectionPage.tsx`

**Features**:
- Available models grid
- Model comparison matrix
- Configuration forms
- Training initiation

```typescript
const ModelSelectionPage: React.FC = () => {
  const { data: availableModels } = useAvailableModels();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, any>>({});

  return (
    <div className="space-y-6">
      <ModelSelectionGrid 
        models={availableModels}
        selected={selectedModels}
        onSelectionChange={setSelectedModels}
      />
      <ModelConfigurationPanel 
        selectedModels={selectedModels}
        configs={configs}
        onConfigChange={setConfigs}
      />
      <TrainingActionPanel 
        models={selectedModels}
        configs={configs}
      />
    </div>
  );
};
```

#### **Training Progress**
**File**: `src/pages/ModelTraining/TrainingProgressPage.tsx`

**Features**:
- Real-time progress tracking
- Live training logs
- Performance metrics
- Cancellation controls

```typescript
const TrainingProgressPage: React.FC = () => {
  const { taskId } = useParams();
  const { data: taskStatus } = useTaskStatus(taskId, { 
    refetchInterval: 2000 
  });

  return (
    <div className="space-y-6">
      <TrainingOverview status={taskStatus} />
      <ProgressTracker models={taskStatus?.models} />
      <LiveLogsPanel taskId={taskId} />
      <MetricsPanel metrics={taskStatus?.metrics} />
    </div>
  );
};
```

### 5. Model Comparison & Ensembles

#### **Model Comparison Interface**
**File**: `src/pages/ModelComparison/ComparisonPage.tsx`

**Features**:
- Side-by-side model comparison
- Attribution agreement analysis
- Performance metrics comparison
- Statistical significance tests

```typescript
const ComparisonPage: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { data: comparison } = useModelComparison(selectedModels);

  return (
    <div className="space-y-6">
      <ModelSelector 
        onSelectionChange={setSelectedModels}
        minSelection={2}
      />
      {comparison && (
        <>
          <AttributionComparisonChart data={comparison.attribution} />
          <MetricsComparisonTable data={comparison.metrics} />
          <AgreementAnalysisPanel data={comparison.agreement} />
          <StatisticalTestsPanel data={comparison.tests} />
        </>
      )}
    </div>
  );
};
```

#### **Ensemble Creation**
**File**: `src/pages/ModelComparison/EnsemblePage.tsx`

**Features**:
- Model weight configuration
- Ensemble performance preview
- Custom ensemble naming
- Ensemble validation

```typescript
const EnsemblePage: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const { mutate: createEnsemble } = useCreateEnsemble();

  return (
    <div className="space-y-6">
      <EnsembleBuilder 
        models={selectedModels}
        weights={weights}
        onWeightsChange={setWeights}
      />
      <EnsemblePreview 
        models={selectedModels}
        weights={weights}
      />
      <EnsembleActions 
        onCreateEnsemble={() => createEnsemble({ models: selectedModels, weights })}
      />
    </div>
  );
};
```

### 6. Analytics & Insights

#### **Attribution Analysis**
**File**: `src/pages/Analytics/AttributionPage.tsx`

**Features**:
- Channel attribution breakdown
- Time-based attribution trends
- Confidence intervals
- Attribution waterfall

```typescript
const AttributionPage: React.FC = () => {
  const { modelId } = useParams();
  const { data: attribution } = useModelAttribution(modelId);
  const { data: trends } = useAttributionTrends(modelId);

  return (
    <div className="space-y-6">
      <AttributionOverview data={attribution} />
      <AttributionWaterfall data={attribution} />
      <AttributionTrends data={trends} />
      <ChannelInsights data={attribution} />
    </div>
  );
};
```

#### **Scenario Planning**
**File**: `src/pages/Analytics/ScenarioPage.tsx`

**Features**:
- Budget scenario builder
- ROI predictions
- Scenario comparison
- Optimization recommendations

```typescript
const ScenarioPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const { data: predictions } = useScenarioPredictions(scenarios);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <ScenarioBuilder 
          scenarios={scenarios}
          onScenariosChange={setScenarios}
        />
      </div>
      <div className="col-span-8">
        <ScenarioResults predictions={predictions} />
        <ScenarioComparison scenarios={scenarios} predictions={predictions} />
        <OptimizationRecommendations data={predictions} />
      </div>
    </div>
  );
};
```

## 🎨 Design System

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Secondary Colors */
  --secondary-50: #f8fafc;
  --secondary-500: #64748b;
  --secondary-600: #475569;

  /* Success/Error/Warning */
  --success-500: #10b981;
  --error-500: #ef4444;
  --warning-500: #f59e0b;

  /* Chart Colors */
  --chart-1: #3b82f6;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #ef4444;
  --chart-5: #8b5cf6;
}
```

### Typography Scale
```css
.text-display-lg { font-size: 3.75rem; line-height: 1; }
.text-display-md { font-size: 3rem; line-height: 1.1; }
.text-heading-xl { font-size: 2.25rem; line-height: 1.2; }
.text-heading-lg { font-size: 1.875rem; line-height: 1.3; }
.text-heading-md { font-size: 1.5rem; line-height: 1.4; }
.text-body-lg { font-size: 1.125rem; line-height: 1.6; }
.text-body-md { font-size: 1rem; line-height: 1.6; }
.text-body-sm { font-size: 0.875rem; line-height: 1.5; }
```

### Component Variants
```typescript
// Button variants
const buttonVariants = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-secondary-100 hover:bg-secondary-200 text-secondary-900",
  outline: "border border-primary-600 text-primary-600 hover:bg-primary-50",
  ghost: "text-secondary-600 hover:bg-secondary-100"
};

// Card variants
const cardVariants = {
  default: "bg-white border border-secondary-200 rounded-lg shadow-sm",
  elevated: "bg-white border border-secondary-200 rounded-lg shadow-md",
  interactive: "bg-white border border-secondary-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
};
```

## 🔧 State Management

### React Query Setup
```typescript
// src/hooks/api/models.ts
export const useAvailableModels = () => {
  return useQuery({
    queryKey: ['models', 'available'],
    queryFn: () => api.models.getAvailable(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrainModels = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.models.train,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useTaskStatus = (taskId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => api.tasks.getStatus(taskId),
    enabled: !!taskId,
    ...options,
  });
};
```

### Context Providers
```typescript
// src/contexts/UserContext.tsx
interface UserContextType {
  user: User | null;
  mode: 'autopilot' | 'copilot';
  setMode: (mode: 'autopilot' | 'copilot') => void;
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

// src/contexts/ModelsContext.tsx
interface ModelsContextType {
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  trainingTasks: TrainingTask[];
  addTrainingTask: (task: TrainingTask) => void;
}
```

## 📊 Chart Components

### Attribution Chart
```typescript
// src/components/Charts/AttributionChart.tsx
interface AttributionChartProps {
  data: AttributionData;
  showConfidenceIntervals?: boolean;
  interactive?: boolean;
}

const AttributionChart: React.FC<AttributionChartProps> = ({
  data,
  showConfidenceIntervals = false,
  interactive = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data.channels}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="channel" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="attribution" fill="var(--chart-1)">
          {showConfidenceIntervals && (
            <ErrorBar dataKey="confidence_interval" width={4} />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### Time Series Chart
```typescript
// src/components/Charts/TimeSeriesChart.tsx
interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  metrics: string[];
  dateRange?: [Date, Date];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metrics,
  dateRange
}) => {
  const filteredData = useMemo(() => {
    if (!dateRange) return data;
    return data.filter(d => 
      d.date >= dateRange[0] && d.date <= dateRange[1]
    );
  }, [data, dateRange]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" type="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        {metrics.map((metric, index) => (
          <Line 
            key={metric}
            type="monotone" 
            dataKey={metric} 
            stroke={`var(--chart-${index + 1})`}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

## 🔄 Real-time Features

### WebSocket Integration
```typescript
// src/hooks/useWebSocket.ts
export const useTrainingProgress = (taskId: string) => {
  const [progress, setProgress] = useState<TrainingProgress | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/training/${taskId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    return () => ws.close();
  }, [taskId]);

  return progress;
};
```

### Live Updates
```typescript
// src/components/TrainingProgress.tsx
const TrainingProgress: React.FC<{ taskId: string }> = ({ taskId }) => {
  const progress = useTrainingProgress(taskId);
  const { data: taskStatus } = useTaskStatus(taskId, {
    refetchInterval: progress?.status === 'running' ? 2000 : false
  });

  return (
    <div className="space-y-4">
      <ProgressBar 
        value={progress?.percentage || 0} 
        max={100}
        className="w-full"
      />
      <div className="grid grid-cols-2 gap-4">
        {progress?.models?.map(model => (
          <ModelProgressCard 
            key={model.type}
            model={model}
          />
        ))}
      </div>
    </div>
  );
};
```

## 🧪 Testing Strategy

### Component Testing
```typescript
// src/components/__tests__/AttributionChart.test.tsx
describe('AttributionChart', () => {
  const mockData = {
    channels: [
      { channel: 'Facebook', attribution: 0.35, confidence_interval: [0.3, 0.4] },
      { channel: 'Google', attribution: 0.45, confidence_interval: [0.4, 0.5] },
    ]
  };

  it('renders attribution data correctly', () => {
    render(<AttributionChart data={mockData} />);
    
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('shows confidence intervals when enabled', () => {
    render(<AttributionChart data={mockData} showConfidenceIntervals />);
    
    // Test for error bars presence
    expect(document.querySelectorAll('.recharts-error-bar')).toHaveLength(2);
  });
});
```

### Integration Testing
```typescript
// src/pages/__tests__/ModelTraining.integration.test.tsx
describe('Model Training Flow', () => {
  it('completes full training workflow', async () => {
    const user = userEvent.setup();
    
    render(<ModelTrainingPage />);
    
    // Select models
    await user.click(screen.getByLabelText('LightweightMMM'));
    await user.click(screen.getByLabelText('Meridian'));
    
    // Configure and start training
    await user.click(screen.getByText('Start Training'));
    
    // Verify training initiated
    expect(screen.getByText('Training in progress...')).toBeInTheDocument();
  });
});
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// src/App.tsx
const Dashboard = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ModelTraining = lazy(() => import('./pages/ModelTraining/ModelSelectionPage'));
const Analytics = lazy(() => import('./pages/Analytics/AttributionPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training" element={<ModelTraining />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

### Data Virtualization
```typescript
// src/components/Tables/VirtualizedTable.tsx
import { FixedSizeList as List } from 'react-window';

const VirtualizedTable: React.FC<{ data: any[]; height: number }> = ({
  data,
  height
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TableRow data={data[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 📱 Responsive Design

### Breakpoint System
```typescript
// src/hooks/useBreakpoint.ts
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};
```

### Mobile-First Components
```typescript
// src/components/Layout/ResponsiveLayout.tsx
const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'sm' || breakpoint === 'md';

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <DesktopLayout>{children}</DesktopLayout>
      )}
    </div>
  );
};
```

## 🔐 Security & Error Handling

### Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// src/services/api.ts
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication error
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

## 📋 Implementation Timeline

### Week 1-2: Core Infrastructure
- [ ] Set up routing and layout components
- [ ] Implement authentication flow
- [ ] Create design system components
- [ ] Set up state management

### Week 3-4: Data Management
- [ ] Build data upload interface
- [ ] Implement data validation
- [ ] Create data preview components
- [ ] Add column mapping functionality

### Week 5-6: Model Training
- [ ] Build model selection interface
- [ ] Implement training configuration
- [ ] Create progress tracking
- [ ] Add real-time updates

### Week 7-8: Analytics & Visualization
- [ ] Implement attribution charts
- [ ] Build scenario planning interface
- [ ] Create model comparison views
- [ ] Add ensemble management

### Week 9-10: Polish & Optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Testing and bug fixes

---

This comprehensive frontend plan provides a roadmap for creating an intuitive, powerful interface for the SmartSight MMM Platform that serves both SMB and enterprise users effectively.
