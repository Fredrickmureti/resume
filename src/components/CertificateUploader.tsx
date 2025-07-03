import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Image, Calendar, Building, Trash2, ExternalLink } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  linked_section: string;
  linked_item_id: string;
  issue_date: string;
  issuer: string;
  created_at: string;
}

interface CertificateUploaderProps {
  resumeData?: any;
  onCertificatesUpdate?: () => void;
}

export const CertificateUploader: React.FC<CertificateUploaderProps> = ({ 
  resumeData, 
  onCertificatesUpdate 
}) => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkedSection, setLinkedSection] = useState('');
  const [linkedItemId, setLinkedItemId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issuer, setIssuer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or image file (JPEG, PNG).",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title || !linkedSection) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload file
      const fileUrl = await uploadFile(selectedFile);
      
      // Save certificate record
      const { error } = await supabase
        .from('certificates')
        .insert({
          user_id: user?.id,
          title,
          description,
          file_url: fileUrl,
          file_type: selectedFile.type.includes('pdf') ? 'pdf' : 'image',
          linked_section: linkedSection,
          linked_item_id: linkedItemId,
          issue_date: issueDate || null,
          issuer
        });

      if (error) throw error;

      // Reset form
      setTitle('');
      setDescription('');
      setLinkedSection('');
      setLinkedItemId('');
      setIssueDate('');
      setIssuer('');
      setSelectedFile(null);
      
      // Refresh certificates
      await fetchCertificates();
      onCertificatesUpdate?.();

      toast({
        title: "Certificate Uploaded",
        description: "Your certificate has been successfully uploaded.",
      });
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteCertificate = async (certificateId: string, fileUrl: string) => {
    try {
      // Delete file from storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('certificates')
          .remove([`${user?.id}/${fileName}`]);
      }

      // Delete record
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;

      await fetchCertificates();
      onCertificatesUpdate?.();

      toast({
        title: "Certificate Deleted",
        description: "Certificate has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete certificate.",
        variant: "destructive"
      });
    }
  };

  const getLinkedItems = (section: string) => {
    if (!resumeData) return [];
    
    switch (section) {
      case 'projects':
        return resumeData.projects || [];
      case 'education':
        return resumeData.education || [];
      case 'certifications':
        return resumeData.certifications || [];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Certificate Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AWS Cloud Practitioner"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the certificate..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="linked-section">Link to Section *</Label>
                <Select value={linkedSection} onValueChange={setLinkedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="certifications">Certifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {linkedSection && (
                <div>
                  <Label htmlFor="linked-item">Specific Item</Label>
                  <Select value={linkedItemId} onValueChange={setLinkedItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLinkedItems(linkedSection).map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name || item.degree || item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="file">Certificate File (PDF or Image) *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>My Certificates ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certificates uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {cert.file_type === 'pdf' ? (
                          <FileText className="h-4 w-4 text-red-600" />
                        ) : (
                          <Image className="h-4 w-4 text-blue-600" />
                        )}
                        <h3 className="font-medium">{cert.title}</h3>
                        <Badge variant="outline">
                          {cert.linked_section}
                        </Badge>
                      </div>
                      
                      {cert.description && (
                        <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {cert.issuer && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {cert.issuer}
                          </div>
                        )}
                        {cert.issue_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(cert.issue_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cert.file_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCertificate(cert.id, cert.file_url)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};