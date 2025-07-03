import { supabase } from '@/integrations/supabase/client';
import { ResumeData, Template } from '@/types/resume';
import { toast } from '@/components/ui/use-toast';

export interface SavedResume {
  id: string;
  title: string;
  data: ResumeData;
  template: Template;
  user_id: string;
  job_company?: string;
  job_position?: string;
  application_status?: string;
  created_at: string;
  updated_at: string;
  is_complete: boolean;
  content_validation_score: number;
}

export class ResumeService {
  static async saveResume(
    resumeData: ResumeData, 
    template: Template, 
    title: string,
    resumeId?: string
  ): Promise<SavedResume | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error('ResumeService: No authenticated user found');
        toast({
          title: "Authentication Required",
          description: "Please sign in to save your resume.",
          variant: "destructive"
        });
        return null;
      }

      console.log('ResumeService: Saving resume for user:', user.id);
      console.log('ResumeService: Resume details:', { resumeId, title, hasData: !!resumeData });

      const resumeRecord = {
        title,
        data: resumeData as any, // Cast to any to handle Json type compatibility
        template,
        user_id: user.id,
        is_complete: this.validateResumeCompletion(resumeData),
        content_validation_score: this.calculateValidationScore(resumeData),
        updated_at: new Date().toISOString()
      };

      let result;
      if (resumeId) {
        console.log('ResumeService: Updating existing resume:', resumeId);
        // Update existing resume
        const { data, error } = await supabase
          .from('resumes')
          .update(resumeRecord)
          .eq('id', resumeId)
          .eq('user_id', user.id) // Ensure user can only update their own resumes
          .select()
          .single();
        
        if (error) {
          console.error('ResumeService: Error updating resume:', error);
          console.error('ResumeService: Update error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        result = data;
        console.log('ResumeService: Resume updated successfully:', result);
      } else {
        console.log('ResumeService: Creating new resume');
        // Create new resume
        const { data, error } = await supabase
          .from('resumes')
          .insert(resumeRecord)
          .select()
          .single();
        
        if (error) {
          console.error('ResumeService: Error creating resume:', error);
          console.error('ResumeService: Create error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        result = data;
        console.log('ResumeService: Resume created successfully:', result);
      }

      return {
        ...result,
        data: result.data as unknown as ResumeData,
        template: result.template as Template
      } as SavedResume;
    } catch (error) {
      console.error('ResumeService: Error in saveResume:', error);
      toast({
        title: "Save Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }

  static async loadResume(resumeId: string): Promise<SavedResume | null> {
    try {
      console.log('ResumeService: Loading resume with ID:', resumeId);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) {
        console.error('ResumeService: Error loading resume:', error);
        console.error('ResumeService: Load error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('ResumeService: Resume loaded successfully:', data);
      
      return {
        ...data,
        data: data.data as unknown as ResumeData,
        template: data.template as Template
      } as SavedResume;
    } catch (error) {
      console.error('ResumeService: Error in loadResume:', error);
      toast({
        title: "Load Error",
        description: "Failed to load resume.",
        variant: "destructive"
      });
      return null;
    }
  }

  static async getUserResumes(): Promise<SavedResume[]> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.log('ResumeService: No authenticated user for getUserResumes');
        return [];
      }

      console.log('ResumeService: Fetching resumes for user:', user.id);
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('ResumeService: Error fetching user resumes:', error);
        console.error('ResumeService: Fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('ResumeService: Successfully fetched resumes:', data?.length || 0);
      
      return data.map(resume => ({
        ...resume,
        data: resume.data as unknown as ResumeData,
        template: resume.template as Template
      })) as SavedResume[];
    } catch (error) {
      console.error('ResumeService: Error in getUserResumes:', error);
      return [];
    }
  }

  static async deleteResume(resumeId: string): Promise<boolean> {
    try {
      console.log('ResumeService: Deleting resume:', resumeId);
      
      // First, check if this resume is set as a public resume in any profile
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('public_resume_id', resumeId);

      if (profileError) {
        console.error('ResumeService: Error checking profiles:', profileError);
        throw profileError;
      }

      // If the resume is referenced as a public resume, clear that reference first
      if (profiles && profiles.length > 0) {
        console.log('ResumeService: Clearing public resume references');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ public_resume_id: null, public_resume_enabled: false })
          .eq('public_resume_id', resumeId);

        if (updateError) {
          console.error('ResumeService: Error updating profiles:', updateError);
          throw updateError;
        }
      }

      // Now delete the resume
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) {
        console.error('ResumeService: Error deleting resume:', error);
        throw error;
      }
      
      console.log('ResumeService: Resume deleted successfully');
      return true;
    } catch (error) {
      console.error('ResumeService: Error in deleteResume:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete resume.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async duplicateResume(resumeId: string, newTitle: string): Promise<SavedResume | null> {
    try {
      const originalResume = await this.loadResume(resumeId);
      if (!originalResume) return null;

      return await this.saveResume(
        originalResume.data,
        originalResume.template as Template,
        newTitle
      );
    } catch (error) {
      console.error('Error duplicating resume:', error);
      return null;
    }
  }

  private static validateResumeCompletion(data: ResumeData): boolean {
    return !!(
      data.personalInfo.fullName &&
      data.personalInfo.email &&
      data.summary &&
      data.experience.length > 0
    );
  }

  private static calculateValidationScore(data: ResumeData): number {
    let score = 0;
    
    // Personal info (30 points)
    if (data.personalInfo.fullName) score += 10;
    if (data.personalInfo.email) score += 10;
    if (data.personalInfo.phone) score += 5;
    if (data.personalInfo.location) score += 5;

    // Summary (20 points)
    if (data.summary && data.summary.length > 50) score += 20;

    // Experience (30 points)
    if (data.experience.length > 0) score += 15;
    if (data.experience.length >= 2) score += 10;
    if (data.experience.some(exp => exp.description.length > 0)) score += 5;

    // Education (10 points)
    if (data.education.length > 0) score += 10;

    // Skills (10 points)
    if (data.skills.length > 0) score += 5;
    if (data.skills.length >= 5) score += 5;

    return Math.min(score, 100);
  }
}
