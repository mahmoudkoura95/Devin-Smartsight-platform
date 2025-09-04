import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { AutopilotDashboard } from './AutopilotDashboard';
import { CopilotDashboard } from './CopilotDashboard';

export const DashboardPage: React.FC = () => {
  const { mode } = useUser();

  return mode === 'autopilot' ? <AutopilotDashboard /> : <CopilotDashboard />;
};
