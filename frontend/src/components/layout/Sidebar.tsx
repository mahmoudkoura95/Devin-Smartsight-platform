import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  BarChart3, 
  Upload, 
  Brain, 
  TrendingUp, 
  GitCompare,
  Target,
  Home
} from 'lucide-react';

interface SidebarProps {
  mode: 'autopilot' | 'copilot';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode }) => {
  const autopilotNavItems = [
    { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/app/data/upload', icon: Upload, label: 'Upload Data' },
    { to: '/app/training/select', icon: Brain, label: 'Train Models' },
    { to: '/app/analytics/attribution', icon: BarChart3, label: 'View Results' },
  ];

  const copilotNavItems = [
    { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/app/data/upload', icon: Upload, label: 'Data Management' },
    { to: '/app/training/select', icon: Brain, label: 'Model Training' },
    { to: '/app/comparison', icon: GitCompare, label: 'Model Comparison' },
    { to: '/app/analytics/attribution', icon: BarChart3, label: 'Attribution Analysis' },
    { to: '/app/analytics/scenarios', icon: Target, label: 'Scenario Planning' },
  ];

  const navItems = mode === 'autopilot' ? autopilotNavItems : copilotNavItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
