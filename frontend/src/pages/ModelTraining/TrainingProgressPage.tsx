import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useTaskStatus } from '../../hooks/api';
import { Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const TrainingProgressPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: taskStatus, isLoading } = useTaskStatus(taskId || '', {
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const task = taskStatus as any;
  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Task not found</h2>
        <p className="text-gray-600 mt-2">The training task could not be found.</p>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => navigate('/app/training/select')}
        >
          Start New Training
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <LoadingSpinner size="sm" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Progress</h1>
        <p className="text-gray-600 mt-2">
          Monitor the progress of your MMM model training
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall Progress</CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusIcon(task.status)}
              <span className={`font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {task.status === 'completed' && (
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/app/dashboard')}
                >
                  View Results
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Training Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {task.models?.map((model: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Brain className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{model.type}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(model.status)}
                      <span className={`text-sm capitalize ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{model.progress}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${model.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
