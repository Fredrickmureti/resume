
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          animate: true
        };
      case 'unsaved':
        return {
          icon: AlertCircle,
          text: 'Unsaved changes',
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className={`flex items-center space-x-1 ${config.className}`}>
        <Icon className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} />
        <span className="text-xs">{config.text}</span>
      </Badge>
      {status === 'saved' && lastSaved && (
        <span className="text-xs text-gray-500">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
