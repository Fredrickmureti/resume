
import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { ResumeData, Template } from '@/types/resume';
import { ResumeService } from '@/services/resumeService';

interface UseAutoSaveProps {
  resumeData: ResumeData;
  template: Template;
  resumeId?: string;
  resumeTitle: string;
  enabled: boolean;
  onSave?: (savedResume: any) => void;
  onStatusChange?: (status: 'saved' | 'saving' | 'unsaved' | 'error') => void;
}

export const useAutoSave = ({
  resumeData,
  template,
  resumeId,
  resumeTitle,
  enabled,
  onSave,
  onStatusChange
}: UseAutoSaveProps) => {
  const debouncedResumeDataString = useDebounce(JSON.stringify(resumeData), 3000);
  const lastSavedRef = useRef<string>('');
  const isInitialRender = useRef(true);

  const saveResume = useCallback(async () => {
    if (!enabled || !resumeTitle.trim()) {
      console.log('Auto-save skipped - not enabled or no title');
      return;
    }

    if (debouncedResumeDataString === lastSavedRef.current) {
      console.log('Auto-save skipped - no changes detected');
      return;
    }

    try {
      console.log('Auto-saving resume...', { resumeId, resumeTitle });
      onStatusChange?.('saving');
      
      const savedResume = await ResumeService.saveResume(
        resumeData,
        template,
        resumeTitle,
        resumeId
      );

      if (savedResume) {
        console.log('Auto-save successful:', savedResume.id);
        lastSavedRef.current = debouncedResumeDataString;
        onStatusChange?.('saved');
        onSave?.(savedResume);
      } else {
        onStatusChange?.('error');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      onStatusChange?.('error');
    }
  }, [resumeData, template, resumeId, resumeTitle, enabled, onSave, onStatusChange, debouncedResumeDataString]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (debouncedResumeDataString !== lastSavedRef.current) {
      onStatusChange?.('unsaved');
      saveResume();
    }
  }, [saveResume, debouncedResumeDataString]);

  return { saveResume };
};
