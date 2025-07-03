
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { useJobQueue } from '@/hooks/useJobQueue';
import { JobQueueItem } from '@/services/jobQueue';
import { formatDistanceToNow } from 'date-fns';

const getJobTypeLabel = (jobType: string): string => {
  switch (jobType) {
    case 'cover_letter_generation':
      return 'Cover Letter';
    case 'content_optimization':
      return 'AI Chat';
    case 'resume_generation':
      return 'Resume Content';
    case 'ats_analysis':
      return 'ATS Analysis';
    default:
      return jobType;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

interface JobItemProps {
  job: JobQueueItem;
  onViewResult?: (job: JobQueueItem) => void;
}

const JobItem: React.FC<JobItemProps> = ({ job, onViewResult }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(job.status)}
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
        </div>
        <div>
          <p className="font-medium">{getJobTypeLabel(job.job_type)}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </p>
          {job.error_message && (
            <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {job.retry_count > 0 && (
          <Badge variant="outline" className="text-xs">
            Retry {job.retry_count}
          </Badge>
        )}
        {job.status === 'completed' && job.result_data && onViewResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewResult(job)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </div>
    </div>
  );
};

export const JobStatus: React.FC = () => {
  const { jobs, loading, loadUserJobs } = useJobQueue();

  const handleViewResult = (job: JobQueueItem) => {
    // This could open a modal or navigate to a result page
    console.log('Viewing result for job:', job);
  };

  const handleRefresh = () => {
    loadUserJobs();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Background Jobs</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No background jobs yet</p>
            <p className="text-sm">AI tasks will appear here when you start them</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobItem
                  key={job.id}
                  job={job}
                  onViewResult={handleViewResult}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
