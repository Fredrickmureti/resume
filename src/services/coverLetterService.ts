import { supabase } from '@/integrations/supabase/client';

export interface CoverLetter {
  id: string;
  user_id: string;
  title: string;
  job_description?: string;
  job_company?: string;
  job_position?: string;
  tone: string;
  content?: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}

export interface CreateCoverLetterData {
  title: string;
  job_description?: string;
  job_company?: string;
  job_position?: string;
  tone?: string;
  content?: string;
  status?: 'draft' | 'final';
}

export class CoverLetterService {
  static async createCoverLetter(userId: string, data: CreateCoverLetterData): Promise<CoverLetter | null> {
    console.log('CoverLetterService: Creating cover letter for user:', userId, 'with data:', data);
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: userId,
        ...data
      })
      .select()
      .single();

    if (error) {
      console.error('CoverLetterService: Error creating cover letter:', error);
      return null;
    }

    console.log('CoverLetterService: Cover letter created successfully:', coverLetter);
    return coverLetter as CoverLetter;
  }

  static async updateCoverLetter(id: string, data: Partial<CreateCoverLetterData>): Promise<CoverLetter | null> {
    console.log('CoverLetterService: Updating cover letter:', id, 'with data:', data);
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('CoverLetterService: Error updating cover letter:', error);
      return null;
    }

    console.log('CoverLetterService: Cover letter updated successfully:', coverLetter);
    return coverLetter as CoverLetter;
  }

  static async getUserCoverLetters(userId: string): Promise<CoverLetter[]> {
    console.log('CoverLetterService: Fetching cover letters for user:', userId);
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('CoverLetterService: Error fetching cover letters:', error);
      return [];
    }

    console.log('CoverLetterService: Cover letters fetched:', data?.length || 0);
    return (data || []) as CoverLetter[];
  }

  static async getCoverLetter(id: string): Promise<CoverLetter | null> {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching cover letter:', error);
      return null;
    }

    return data as CoverLetter;
  }

  static async deleteCoverLetter(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cover letter:', error);
      return false;
    }

    return true;
  }

  static async duplicateCoverLetter(id: string): Promise<CoverLetter | null> {
    const original = await this.getCoverLetter(id);
    if (!original) return null;

    const duplicateData: CreateCoverLetterData = {
      title: `${original.title} (Copy)`,
      job_description: original.job_description,
      job_company: original.job_company,
      job_position: original.job_position,
      tone: original.tone,
      content: original.content,
      status: 'draft'
    };

    return this.createCoverLetter(original.user_id, duplicateData);
  }

  // Auto-save functionality
  static async autoSaveCoverLetter(id: string, content: string): Promise<boolean> {
    const { error } = await supabase
      .from('cover_letters')
      .update({ content })
      .eq('id', id);

    return !error;
  }
}