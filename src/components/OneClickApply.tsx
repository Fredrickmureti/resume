import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  Plus, 
  FileText, 
  Building2, 
  Mail, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Zap,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface JobApplication {
  id: string;
  resume_id: string | null;
  job_title: string;
  company_name: string;
  job_description: string | null;
  job_url: string | null;
  contact_email: string | null;
  contact_name: string | null;
  application_status: string;
  application_email_subject: string | null;
  application_email_body: string | null;
  applied_at: string | null;
  response_received: boolean;
  response_date: string | null;
  notes: string | null;
  salary_range: string | null;
  location: string | null;
  job_type: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface Resume {
  id: string;
  title: string;
  template: string;
  updated_at: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  applied: 'bg-blue-100 text-blue-800 border-blue-300',
  interview: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  offer: 'bg-green-100 text-green-800 border-green-300',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-300'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300'
};

export const OneClickApply: React.FC = () => {
  const { user } = useAuth();
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewApplication, setShowNewApplication] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    resume_id: '',
    job_title: '',
    company_name: '',
    job_description: '',
    job_url: '',
    contact_email: '',
    contact_name: '',
    salary_range: '',
    location: '',
    job_type: 'full-time',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchJobApplications();
      fetchResumes();
    }
  }, [user]);

  const fetchJobApplications = async () => {
    if (!user) return;

    try {
      console.log('OneClickApply: Fetching job applications for user:', user.id);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('OneClickApply: Job applications fetch result:', { data, error, count: data?.length });
      if (error) throw error;
      setJobApplications(data || []);
    } catch (error) {
      console.error('OneClickApply: Error fetching job applications:', error);
      toast({
        title: "Error",
        description: "Failed to load job applications.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;

    try {
      console.log('OneClickApply: Fetching resumes for user:', user.id);
      const { data, error } = await supabase
        .from('resumes')
        .select('id, title, template, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('OneClickApply: Resumes fetch result:', { data, error, count: data?.length });
      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('OneClickApply: Error fetching resumes:', error);
    }
  };

  const generateApplicationEmail = async (jobTitle: string, companyName: string, contactName?: string, jobDescription?: string) => {
    setGenerating(true);
    try {
      const prompt = `Generate a professional job application email for the following position:
      
Job Title: ${jobTitle}
Company: ${companyName}
${contactName ? `Contact Person: ${contactName}` : ''}
${jobDescription ? `Job Description: ${jobDescription.substring(0, 500)}...` : ''}

Please generate:
1. A professional email subject line
2. A well-structured email body that:
   - Addresses the hiring manager professionally
   - Expresses interest in the specific position
   - Briefly highlights relevant qualifications
   - Mentions that a resume is attached
   - Requests an interview opportunity
   - Uses a professional but engaging tone
   - Keeps it concise (under 200 words)

Format as JSON with "subject" and "body" fields.`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-assistant', {
        body: {
          prompt,
          context: 'job_application_email',
          user_id: user?.id
        }
      });

      if (error) throw error;

      const aiResponse = data.choices?.[0]?.message?.content || data.response;
      
      // Try to parse as JSON, fallback to text parsing
      let emailContent;
      try {
        emailContent = JSON.parse(aiResponse);
      } catch {
        // Fallback: extract subject and body from text
        const subjectMatch = aiResponse.match(/subject[:\s]*(.+?)(?:\n|body)/i);
        const bodyMatch = aiResponse.match(/body[:\s]*([\s\S]+?)(?:\n\n|\n---|\nGenerated|$)/i);
        
        emailContent = {
          subject: subjectMatch?.[1]?.trim() || `Application for ${jobTitle} Position`,
          body: bodyMatch?.[1]?.trim() || aiResponse
        };
      }

      return emailContent;
    } catch (error) {
      console.error('Error generating application email:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate application email. Using template instead.",
        variant: "destructive"
      });
      
      // Fallback template
      return {
        subject: `Application for ${jobTitle} Position`,
        body: `Dear ${contactName || 'Hiring Manager'},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. 

With my background and experience, I am confident that I would be a valuable addition to your team. I have attached my resume for your review, which provides detailed information about my qualifications and achievements.

I would welcome the opportunity to discuss how my skills and experience can contribute to ${companyName}'s continued success. I am available for an interview at your convenience.

Thank you for considering my application. I look forward to hearing from you soon.

Best regards,
[Your Name]`
      };
    } finally {
      setGenerating(false);
    }
  };

  const saveJobApplication = async () => {
    if (!user || !formData.job_title || !formData.company_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the job title and company name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const applicationData = {
        ...formData,
        user_id: user.id,
        resume_id: formData.resume_id || null,
        application_status: 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('OneClickApply: Saving job application for user:', user.id, 'data:', applicationData);

      let result;
      if (editingApplication) {
        console.log('OneClickApply: Updating existing application:', editingApplication.id);
        result = await supabase
          .from('job_applications')
          .update(applicationData)
          .eq('id', editingApplication.id)
          .select()
          .single();
      } else {
        console.log('OneClickApply: Creating new application');
        result = await supabase
          .from('job_applications')
          .insert(applicationData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('OneClickApply: Database error:', result.error);
        throw result.error;
      }

      console.log('OneClickApply: Job application saved successfully:', result.data);
      await fetchJobApplications();
      resetForm();
      setShowNewApplication(false);
      setEditingApplication(null);

      toast({
        title: "Success",
        description: editingApplication ? "Job application updated successfully." : "Job application saved successfully.",
      });
    } catch (error) {
      console.error('OneClickApply: Error saving job application:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save job application.",
        variant: "destructive"
      });
    }
  };

  const generateAndApply = async () => {
    if (!user || !formData.job_title || !formData.company_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the job title and company name.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate email content
      const emailContent = await generateApplicationEmail(
        formData.job_title,
        formData.company_name,
        formData.contact_name,
        formData.job_description
      );

      // Save application with generated email
      const applicationData = {
        ...formData,
        user_id: user.id,
        resume_id: formData.resume_id || null,
        application_status: 'applied',
        application_email_subject: emailContent.subject,
        application_email_body: emailContent.body,
        applied_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('job_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;

      await fetchJobApplications();
      resetForm();
      setShowNewApplication(false);

      toast({
        title: "Application Generated!",
        description: "Your job application email has been generated and saved. You can now send it to the employer.",
      });

      // Show generated email in a modal or copy to clipboard
      showGeneratedEmail(emailContent);
    } catch (error) {
      console.error('Error generating and applying:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate application.",
        variant: "destructive"
      });
    }
  };

  const showGeneratedEmail = (emailContent: { subject: string; body: string }) => {
    const emailText = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(emailText).then(() => {
      toast({
        title: "Email Copied!",
        description: "The application email has been copied to your clipboard. You can now paste it into your email client.",
      });
    });
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { 
        application_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'applied' && !jobApplications.find(app => app.id === id)?.applied_at) {
        updateData.applied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchJobApplications();
      toast({
        title: "Status Updated",
        description: `Application status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    }
  };

  const deleteJobApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchJobApplications();
      toast({
        title: "Deleted",
        description: "Job application deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting job application:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete job application.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      resume_id: '',
      job_title: '',
      company_name: '',
      job_description: '',
      job_url: '',
      contact_email: '',
      contact_name: '',
      salary_range: '',
      location: '',
      job_type: 'full-time',
      priority: 'medium',
      notes: ''
    });
  };

  const editApplication = (application: JobApplication) => {
    setFormData({
      resume_id: application.resume_id || '',
      job_title: application.job_title,
      company_name: application.company_name,
      job_description: application.job_description || '',
      job_url: application.job_url || '',
      contact_email: application.contact_email || '',
      contact_name: application.contact_name || '',
      salary_range: application.salary_range || '',
      location: application.location || '',
      job_type: application.job_type,
      priority: application.priority,
      notes: application.notes || ''
    });
    setEditingApplication(application);
    setShowNewApplication(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Send className="h-4 w-4" />;
      case 'interview': return <Clock className="h-4 w-4" />;
      case 'offer': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'withdrawn': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            One-Click Apply (Job Tracker)
          </h2>
          <p className="text-muted-foreground">Track your job applications and generate professional application emails</p>
        </div>
        <Button 
          onClick={() => setShowNewApplication(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{jobApplications.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {jobApplications.filter(app => app.application_status === 'applied').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {jobApplications.filter(app => app.application_status === 'interview').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offers</p>
                <p className="text-2xl font-bold text-green-600">
                  {jobApplications.filter(app => app.application_status === 'offer').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New/Edit Application Dialog */}
      <Dialog open={showNewApplication} onOpenChange={setShowNewApplication}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingApplication ? 'Edit Job Application' : 'New Job Application'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Job Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="e.g., Tech Corp Inc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-select">Select Resume</Label>
                <Select
                  value={formData.resume_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, resume_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resume" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title} ({resume.template})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-type">Job Type</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., San Francisco, CA (Remote)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary-range">Salary Range</Label>
                <Input
                  id="salary-range"
                  value={formData.salary_range}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
            </div>

            {/* Contact & Additional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact & Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact Person</Label>
                <Input
                  id="contact-name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="e.g., John Smith, HR Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="e.g., hr@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-url">Job URL</Label>
                <Input
                  id="job-url"
                  value={formData.job_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_url: e.target.value }))}
                  placeholder="e.g., https://company.com/careers/job-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  value={formData.job_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_description: e.target.value }))}
                  placeholder="Paste the job description here for better email generation..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this application..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={generateAndApply}
              disabled={generating || !formData.job_title || !formData.company_name}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Generating Email...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate & Apply
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={saveJobApplication}
              disabled={!formData.job_title || !formData.company_name}
            >
              <FileText className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNewApplication(false);
                setEditingApplication(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Applications List */}
      <div className="space-y-4">
        {jobApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{application.job_title}</h3>
                    <Badge className={`${statusColors[application.application_status as keyof typeof statusColors]} flex items-center gap-1`}>
                      {getStatusIcon(application.application_status)}
                      {application.application_status}
                    </Badge>
                    <Badge className={`${priorityColors[application.priority as keyof typeof priorityColors]}`}>
                      {application.priority} priority
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {application.company_name}
                    </div>
                    {application.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.location}
                      </div>
                    )}
                    {application.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {application.salary_range}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {new Date(application.created_at).toLocaleDateString()}</span>
                    {application.applied_at && (
                      <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
                    )}
                    {application.contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {application.contact_email}
                      </div>
                    )}
                    {application.job_url && (
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Job
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Update Dropdown */}
                  <Select
                    value={application.application_status}
                    onValueChange={(value) => updateApplicationStatus(application.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editApplication(application)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {application.application_email_body && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const emailText = `Subject: ${application.application_email_subject || 'Job Application'}\n\n${application.application_email_body}`;
                        navigator.clipboard.writeText(emailText);
                        toast({
                          title: "Email Copied!",
                          description: "Application email copied to clipboard.",
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteJobApplication(application.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {application.notes && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{application.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {jobApplications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Job Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your job applications and generate professional application emails with AI.
              </p>
              <Button onClick={() => setShowNewApplication(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};