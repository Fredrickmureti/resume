import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Download, TrendingUp, Shield, AlertCircle, Bell, Mail, Settings, Coins } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CreditService } from '@/services/creditService';
import { NotificationService } from '@/services/notificationService';

interface UserData {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  last_login_at: string | null;
  resume_count: number;
  total_downloads: number;
  total_generations: number;
  current_credits?: number;
  total_used_credits?: number;
}

interface CreditSettings {
  free_daily_credits: number;
  resume_generation_cost: number;
  cover_letter_cost: number;
  pdf_download_cost: number;
  ai_suggestions_cost: number;
  ats_analysis_cost: number;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalDownloads: 0,
    totalGenerations: 0
  });

  // Add a timeout to prevent infinite loading
  const [forceLoaded, setForceLoaded] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceLoaded(true);
    }, 5000); // Force load after 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    if (user && user.email !== 'fredrickmureti612@gmail.com') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      return;
    }

    if (user) {
      fetchAdminData();
    }
  }, [user, loading, navigate]);

  // Admin state management
  const [creditSettings, setCreditSettings] = useState<CreditSettings>({
    free_daily_credits: 50,
    resume_generation_cost: 5,
    cover_letter_cost: 3,
    pdf_download_cost: 1,
    ai_suggestions_cost: 2,
    ats_analysis_cost: 2
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    content: '',
    message_type: 'announcement' as 'announcement' | 'warning' | 'maintenance' | 'feature',
    target_audience: 'all' as 'all' | 'free' | 'premium',
    send_email: false
  });
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState(0);

  const fetchAdminData = async () => {
    try {
      // Fetch all users with their resume and credit statistics
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          created_at,
          last_login_at
        `);

      if (usersError) throw usersError;

      // Fetch resume statistics
      const { data: resumeStats, error: resumeError } = await supabase
        .from('resumes')
        .select(`
          user_id,
          downloaded_count,
          generated_count
        `);

      if (resumeError) throw resumeError;

      // Fetch credit information
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, current_credits, total_used_credits');

      if (creditsError) throw creditsError;

      // Combine all data
      const enrichedUsers = usersData?.map(user => {
        const userResumes = resumeStats?.filter(resume => resume.user_id === user.id) || [];
        const userCredits = creditsData?.find(credit => credit.user_id === user.id);
        
        return {
          ...user,
          resume_count: userResumes.length,
          total_downloads: userResumes.reduce((sum, resume) => sum + (resume.downloaded_count || 0), 0),
          total_generations: userResumes.reduce((sum, resume) => sum + (resume.generated_count || 0), 0),
          current_credits: userCredits?.current_credits || 0,
          total_used_credits: userCredits?.total_used_credits || 0
        };
      }) || [];

      setUsers(enrichedUsers);

      // Calculate overall statistics
      setStats({
        totalUsers: enrichedUsers.length,
        totalResumes: resumeStats?.length || 0,
        totalDownloads: resumeStats?.reduce((sum, resume) => sum + (resume.downloaded_count || 0), 0) || 0,
        totalGenerations: resumeStats?.reduce((sum, resume) => sum + (resume.generated_count || 0), 0) || 0
      });

      // Fetch credit settings
      const costs = await CreditService.getCreditCosts();
      setCreditSettings(prev => ({ ...prev, ...costs }));

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data.",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const sendNotification = async () => {
    try {
      const notification = await NotificationService.createAdminMessage({
        ...notificationForm,
        created_by: user!.id,
        is_active: true
      });

      if (notification) {
        toast({
          title: "Success",
          description: "Notification sent successfully to all users.",
        });
        setNotificationForm({
          title: '',
          content: '',
          message_type: 'announcement',
          target_audience: 'all',
          send_email: false
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive"
      });
    }
  };

  const updateCreditSettings = async (setting: string, value: number) => {
    try {
      const success = await CreditService.updateCreditSetting(setting, value);
      if (success) {
        setCreditSettings(prev => ({ ...prev, [setting]: value }));
        toast({
          title: "Success",
          description: "Credit setting updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating credit setting:', error);
      toast({
        title: "Error",
        description: "Failed to update credit setting.",
        variant: "destructive"
      });
    }
  };

  const adjustUserCredits = async () => {
    if (!selectedUser || creditAdjustment === 0) return;

    try {
      const newAmount = (selectedUser.current_credits || 0) + creditAdjustment;
      const success = await CreditService.adjustUserCredits(selectedUser.id, Math.max(0, newAmount));
      
      if (success) {
        toast({
          title: "Success",
          description: `Credits ${creditAdjustment > 0 ? 'added to' : 'deducted from'} ${selectedUser.email}.`,
        });
        setSelectedUser(null);
        setCreditAdjustment(0);
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Error adjusting user credits:', error);
      toast({
        title: "Error",
        description: "Failed to adjust user credits.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityStatus = (lastLogin: string | null) => {
    if (!lastLogin) return { status: 'inactive', color: 'bg-gray-500' };
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const daysDiff = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return { status: 'active', color: 'bg-green-500' };
    if (daysDiff <= 7) return { status: 'recent', color: 'bg-yellow-500' };
    return { status: 'inactive', color: 'bg-red-500' };
  };

  // Show loading only if auth is loading AND we haven't force loaded yet  
  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">ResumeAI Pro Administration Panel</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => fetchAdminData()}
                variant="outline"
              >
                Refresh Data
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800 font-medium">
                This is a restricted admin area. All actions are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResumes}</div>
              <p className="text-xs text-muted-foreground">
                Created resumes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">
                PDF downloads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                AI generations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Credit Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Overview of all registered users and their activity
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Resumes</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Generations</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => {
                        const activity = getActivityStatus(userData.last_login_at);
                        return (
                          <TableRow key={userData.id}>
                            <TableCell>
                              <div className="font-medium">
                                {userData.full_name || 'No Name'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined {formatDate(userData.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {userData.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                                <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                                <span className="capitalize">{activity.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-green-700 bg-green-100">
                                {userData.current_credits || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-red-700 border-red-200">
                                {userData.total_used_credits || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {userData.resume_count}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {userData.total_downloads}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {userData.total_generations}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedUser(userData)}
                                  >
                                    <Coins className="h-3 w-3 mr-1" />
                                    Adjust Credits
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Adjust Credits for {userData.email}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Current Credits: {userData.current_credits || 0}</Label>
                                    </div>
                                    <div>
                                      <Label htmlFor="creditAdjustment">Credit Adjustment</Label>
                                      <Input
                                        id="creditAdjustment"
                                        type="number"
                                        value={creditAdjustment}
                                        onChange={(e) => setCreditAdjustment(parseInt(e.target.value) || 0)}
                                        placeholder="Enter amount (positive to add, negative to subtract)"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        New total will be: {Math.max(0, (userData.current_credits || 0) + creditAdjustment)}
                                      </p>
                                    </div>
                                    <Button onClick={adjustUserCredits} className="w-full">
                                      Apply Changes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600">There are no registered users in the system yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Send Notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={notificationForm.content}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Notification message"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message_type">Type</Label>
                    <Select 
                      value={notificationForm.message_type} 
                      onValueChange={(value) => setNotificationForm(prev => ({ ...prev, message_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="feature">New Feature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Select 
                      value={notificationForm.target_audience} 
                      onValueChange={(value) => setNotificationForm(prev => ({ ...prev, target_audience: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="free">Free Users</SelectItem>
                        <SelectItem value="premium">Premium Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="send_email"
                      checked={notificationForm.send_email}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, send_email: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="send_email">Also send email notification</Label>
                  </div>
                  <Button onClick={sendNotification} className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Broadcast (Coming Soon)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Direct email functionality will be available soon.</p>
                    <p className="text-sm">Use notifications with email option for now.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Credit Management Tab */}
          <TabsContent value="credits">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Global Credit Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Free Daily Credits</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.free_daily_credits}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, free_daily_credits: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('free_daily_credits', creditSettings.free_daily_credits)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Resume Generation Cost</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.resume_generation_cost}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, resume_generation_cost: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('resume_generation_cost', creditSettings.resume_generation_cost)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Cover Letter Cost</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.cover_letter_cost}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, cover_letter_cost: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('cover_letter_cost', creditSettings.cover_letter_cost)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>PDF Download Cost</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.pdf_download_cost}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, pdf_download_cost: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('pdf_download_cost', creditSettings.pdf_download_cost)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>AI Suggestions Cost</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.ai_suggestions_cost}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, ai_suggestions_cost: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('ai_suggestions_cost', creditSettings.ai_suggestions_cost)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>ATS Analysis Cost</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={creditSettings.ats_analysis_cost}
                          onChange={(e) => setCreditSettings(prev => ({ ...prev, ats_analysis_cost: parseInt(e.target.value) || 0 }))}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => updateCreditSettings('ats_analysis_cost', creditSettings.ats_analysis_cost)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {users.reduce((sum, user) => sum + (user.current_credits || 0), 0)}
                      </div>
                      <p className="text-sm text-gray-600">Total Available Credits</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {users.reduce((sum, user) => sum + (user.total_used_credits || 0), 0)}
                      </div>
                      <p className="text-sm text-gray-600">Total Credits Used</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {users.length > 0 ? Math.round(users.reduce((sum, user) => sum + (user.current_credits || 0), 0) / users.length) : 0}
                      </div>
                      <p className="text-sm text-gray-600">Average Credits per User</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Additional system settings will be available here.</p>
                    <p className="text-sm">Including email configuration, backup settings, and more.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
