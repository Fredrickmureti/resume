
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Target,
  Award,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalResumes: number;
  totalDownloads: number;
  avgScore: number;
  recentActivity: any[];
  templateUsage: any[];
  monthlyProgress: any[];
  completionRates: any[];
}

const chartConfig = {
  resumes: {
    label: "Resumes",
    color: "#3b82f6",
  },
  downloads: {
    label: "Downloads", 
    color: "#10b981",
  },
  views: {
    label: "Views",
    color: "#f59e0b",
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalResumes: 0,
    totalDownloads: 0,
    avgScore: 0,
    recentActivity: [],
    templateUsage: [],
    monthlyProgress: [],
    completionRates: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch resumes data
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user?.id);

      if (resumesError) throw resumesError;

      // Fetch credit transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      // Process data
      const totalResumes = resumes?.length || 0;
      const totalDownloads = resumes?.reduce((sum, r) => sum + (r.downloaded_count || 0), 0) || 0;
      const avgScore = resumes?.length > 0 
        ? Math.round(resumes.reduce((sum, r) => sum + (r.content_validation_score || 0), 0) / resumes.length)
        : 0;

      // Template usage analysis
      const templateCounts = resumes?.reduce((acc, resume) => {
        acc[resume.template] = (acc[resume.template] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const templateUsage = Object.entries(templateCounts).map(([template, count]) => ({
        name: template.charAt(0).toUpperCase() + template.slice(1),
        value: count,
        percentage: Math.round((count / totalResumes) * 100)
      }));

      // Monthly progress (mock data for now)
      const monthlyProgress = [
        { month: 'Jan', resumes: 2, downloads: 5, views: 12 },
        { month: 'Feb', resumes: 3, downloads: 8, views: 18 },
        { month: 'Mar', resumes: 1, downloads: 12, views: 25 },
        { month: 'Apr', resumes: 4, downloads: 15, views: 32 },
        { month: 'May', resumes: 2, downloads: 18, views: 28 },
        { month: 'Jun', resumes: 3, downloads: 22, views: 35 }
      ];

      // Completion rates
      const completionRates = resumes?.map(resume => ({
        name: resume.title,
        completion: resume.is_complete ? 100 : Math.random() * 100,
        score: resume.content_validation_score || 0
      })) || [];

      setAnalytics({
        totalResumes,
        totalDownloads,
        avgScore,
        recentActivity: transactions || [],
        templateUsage,
        monthlyProgress,
        completionRates
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalResumes}</p>
                <p className="text-sm text-gray-600">Total Resumes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.totalDownloads}</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.avgScore}%</p>
                <p className="text-sm text-gray-600">Avg. Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {analytics.recentActivity.length}
                </p>
                <p className="text-sm text-gray-600">Recent Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Monthly Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="resumes" fill="var(--color-resumes)" />
                      <Bar dataKey="downloads" fill="var(--color-downloads)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Template Usage Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Template Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.templateUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.templateUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.completionRates.map((resume, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{resume.name}</span>
                      <Badge variant={resume.completion > 80 ? 'default' : 'secondary'}>
                        {Math.round(resume.completion)}% Complete
                      </Badge>
                    </div>
                    <Progress value={resume.completion} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Quality Score: {resume.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.templateUsage.map((template, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600">
                        {template.value} resume{template.value !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {template.percentage}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action_type}</p>
                        <p className="text-sm text-gray-600">
                          {activity.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        -{activity.credits_used} credits
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
