import React from 'react';

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`} />
    </div>
  );
};

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = () => setHasError(true);
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm">
        <span>{current} of {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const FileUpload = ({
  onFileSelect,
  accept = '.pdf',
  maxSize = 50,
}: {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSize * 1024 * 1024) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <p className="text-sm font-medium text-gray-700">Drag and drop your PDF here</p>
        <p className="text-xs text-gray-500">or click to select (max {maxSize}MB)</p>
      </label>
    </div>
  );
};
