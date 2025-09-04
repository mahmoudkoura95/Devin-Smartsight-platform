import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProvider } from './contexts/UserContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { DataUploadPage } from './pages/DataManagement/DataUploadPage';
import { ModelSelectionPage } from './pages/ModelTraining/ModelSelectionPage';
import { TrainingProgressPage } from './pages/ModelTraining/TrainingProgressPage';
import { ComparisonPage } from './pages/ModelComparison/ComparisonPage';
import { AttributionPage } from './pages/Analytics/AttributionPage';
import { ScenarioPage } from './pages/Analytics/ScenarioPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="data/upload" element={<DataUploadPage />} />
                <Route path="training/select" element={<ModelSelectionPage />} />
                <Route path="training/progress/:taskId" element={<TrainingProgressPage />} />
                <Route path="comparison" element={<ComparisonPage />} />
                <Route path="analytics/attribution/:modelId" element={<AttributionPage />} />
                <Route path="analytics/attribution" element={<AttributionPage />} />
                <Route path="analytics/scenarios" element={<ScenarioPage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
