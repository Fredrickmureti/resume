
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FormState {
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  selectedType: string;
}

interface FormStateContextType {
  formState: FormState;
  updateFormState: (updates: Partial<FormState>) => void;
  clearFormState: () => void;
}

const FormStateContext = createContext<FormStateContextType | undefined>(undefined);

const FORM_STORAGE_KEY = 'resume_form_state';

export const FormStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(FORM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading form state:', error);
    }
    
    return {
      jobTitle: '',
      industry: '',
      experienceLevel: '',
      selectedType: 'all'
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formState));
    } catch (error) {
      console.error('Error saving form state:', error);
    }
  }, [formState]);

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const clearFormState = () => {
    setFormState({
      jobTitle: '',
      industry: '',
      experienceLevel: '',
      selectedType: 'all'
    });
  };

  return (
    <FormStateContext.Provider value={{
      formState,
      updateFormState,
      clearFormState
    }}>
      {children}
    </FormStateContext.Provider>
  );
};

export const useFormState = () => {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
};
