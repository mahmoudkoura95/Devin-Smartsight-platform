import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/Button';

export const ModeToggle: React.FC = () => {
  const { mode, setMode } = useUser();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={mode === 'autopilot' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setMode('autopilot')}
      >
        Autopilot
      </Button>
      <Button
        variant={mode === 'copilot' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setMode('copilot')}
      >
        Co-Pilot
      </Button>
    </div>
  );
};
