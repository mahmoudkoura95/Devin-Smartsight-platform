import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { ModeToggle } from './ModeToggle';
import { Button } from '../ui/Button';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, mode } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">SmartSight</h1>
          <span className="text-sm text-gray-500">
            {mode === 'autopilot' ? 'Autopilot Mode' : 'Co-Pilot Mode'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-700">
                Welcome, {user.full_name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
