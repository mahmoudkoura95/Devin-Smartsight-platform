import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@smartsight.com');
  const [password, setPassword] = useState('demo123');
  const navigate = useNavigate();
  const { setUser, mode } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorage.setItem('access_token', 'demo-token');
    setUser({
      id: '1',
      email: email,
      full_name: 'Demo User',
      is_active: true,
    });
    
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Login to SmartSight
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            {mode === 'autopilot' ? 'Autopilot Mode' : 'Co-Pilot Mode'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials are pre-filled
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
