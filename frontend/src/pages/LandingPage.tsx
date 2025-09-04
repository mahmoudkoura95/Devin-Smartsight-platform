import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setMode } = useUser();

  const handleModeSelect = (mode: 'autopilot' | 'copilot') => {
    setMode(mode);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SmartSight MMM Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Marketing Mix Modeling for Everyone
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Choose your experience: Autopilot for simplified SMB workflows or Co-Pilot for advanced enterprise analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleModeSelect('autopilot')}>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary-600">
                Autopilot Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Perfect for SMBs and marketers who want automated insights with minimal setup
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Automated model selection</li>
                <li>• Simplified dashboard</li>
                <li>• Quick insights</li>
                <li>• Guided workflows</li>
              </ul>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={() => handleModeSelect('autopilot')}
              >
                Start with Autopilot
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleModeSelect('copilot')}>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-secondary-600">
                Co-Pilot Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Advanced interface for enterprises and data scientists who need full control
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Multiple model comparison</li>
                <li>• Advanced analytics</li>
                <li>• Scenario planning</li>
                <li>• Custom configurations</li>
              </ul>
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full"
                onClick={() => handleModeSelect('copilot')}
              >
                Start with Co-Pilot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
