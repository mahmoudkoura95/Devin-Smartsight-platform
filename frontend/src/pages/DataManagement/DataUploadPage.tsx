import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useUploadMarketingData, useMarketingData } from '../../hooks/api';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const DataUploadPage: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const uploadMutation = useUploadMarketingData();
  const { data: marketingData, refetch } = useMarketingData();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');

    try {
      await uploadMutation.mutateAsync(file);
      setUploadStatus('success');
      refetch();
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  }, [uploadMutation, refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage your marketing data for MMM analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Marketing Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploadStatus === 'uploading' ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" className="mx-auto" />
                  <p className="text-gray-600">Uploading your data...</p>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-green-600 font-medium">Upload successful!</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadStatus('idle')}
                  >
                    Upload Another File
                  </Button>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <p className="text-red-600 font-medium">Upload failed</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUploadStatus('idle')}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your marketing data'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports CSV, XLS, XLSX files up to 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Required Columns:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Date (YYYY-MM-DD format)</li>
                <li>• Revenue or Conversions</li>
                <li>• Media spend columns (e.g., Facebook_spend, Google_spend)</li>
                <li>• Optional: External factors (seasonality, events)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            {marketingData?.data && marketingData.data.length > 0 ? (
              <div className="space-y-3">
                {marketingData.data.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{dataset.filename}</p>
                        <p className="text-sm text-gray-600">
                          {dataset.row_count} rows • {dataset.columns.length} columns
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(dataset.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No datasets uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload your first dataset to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
