
/**
 * Utility functions for normalizing and formatting dates across the application
 */

export interface DateNormalizationResult {
  normalized: string;
  isValid: boolean;
  original: string;
}

/**
 * Normalizes various date formats to YYYY-MM format
 * Handles formats like: MM/YYYY, MM-YYYY, YYYY-MM, YYYY/MM, Month YYYY, etc.
 */
export const normalizeDateToYYYYMM = (dateString: string): DateNormalizationResult => {
  const original = dateString?.toString() || '';
  
  if (!original || original.trim() === '') {
    return { normalized: '', isValid: false, original };
  }

  const trimmed = original.trim().toLowerCase();
  
  // Handle special cases
  if (trimmed === 'present' || trimmed === 'current' || trimmed === 'ongoing') {
    return { normalized: 'Present', isValid: true, original };
  }

  // Remove any extra whitespace and normalize separators
  let cleaned = trimmed.replace(/[\/\-\s]+/g, '-');
  
  // Handle month names (convert to numbers)
  const monthMap: { [key: string]: string } = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };

  // Replace month names with numbers
  for (const [monthName, monthNum] of Object.entries(monthMap)) {
    if (cleaned.includes(monthName)) {
      cleaned = cleaned.replace(monthName, monthNum);
      break;
    }
  }

  // Extract numbers from the cleaned string
  const numbers = cleaned.match(/\d+/g);
  
  if (!numbers || numbers.length === 0) {
    return { normalized: '', isValid: false, original };
  }

  // If we have only one number, assume it's a year
  if (numbers.length === 1) {
    const year = parseInt(numbers[0]);
    if (year >= 1900 && year <= 2100) {
      return { normalized: `${year}-01`, isValid: true, original };
    }
    return { normalized: '', isValid: false, original };
  }

  // If we have two numbers, determine which is month and which is year
  if (numbers.length >= 2) {
    let month: number, year: number;
    
    const num1 = parseInt(numbers[0]);
    const num2 = parseInt(numbers[1]);
    
    // Detect format based on the values
    if (num1 > 12 && num1 >= 1900) {
      // First number is likely year (YYYY-MM format)
      year = num1;
      month = num2;
    } else if (num2 >= 1900) {
      // Second number is likely year (MM-YYYY format)
      month = num1;
      year = num2;
    } else {
      // Fallback: assume MM-YY format and convert YY to full year
      month = num1;
      year = num2 < 50 ? 2000 + num2 : 1900 + num2;
    }
    
    // Validate month
    if (month < 1 || month > 12) {
      // If month is invalid, try to use just the year
      if (year >= 1900 && year <= 2100) {
        return { normalized: `${year}-01`, isValid: true, original };
      }
      return { normalized: '', isValid: false, original };
    }
    
    // Validate year
    if (year < 1900 || year > 2100) {
      return { normalized: '', isValid: false, original };
    }
    
    // Format month with leading zero
    const formattedMonth = month.toString().padStart(2, '0');
    
    return { 
      normalized: `${year}-${formattedMonth}`, 
      isValid: true, 
      original 
    };
  }

  return { normalized: '', isValid: false, original };
};

/**
 * Formats a YYYY-MM date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  const trimmed = dateString.trim();
  
  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return 'Present';
  }

  // Handle YYYY-MM format
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      
      // Convert month number to name
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const monthIndex = parseInt(month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
      
      return `${month}/${year}`;
    }
  }

  return dateString;
};

/**
 * Validates and normalizes all dates in resume data
 */
export const normalizeResumeDataDates = (data: any): any => {
  if (!data) return data;

  const normalizedData = { ...data };

  // Normalize experience dates
  if (normalizedData.experience) {
    normalizedData.experience = normalizedData.experience.map((exp: any) => ({
      ...exp,
      startDate: exp.startDate ? normalizeDateToYYYYMM(exp.startDate).normalized : '',
      endDate: exp.endDate ? normalizeDateToYYYYMM(exp.endDate).normalized : ''
    }));
  }

  // Normalize education dates
  if (normalizedData.education) {
    normalizedData.education = normalizedData.education.map((edu: any) => ({
      ...edu,
      graduationDate: edu.graduationDate ? normalizeDateToYYYYMM(edu.graduationDate).normalized : ''
    }));
  }

  // Normalize project dates
  if (normalizedData.projects) {
    normalizedData.projects = normalizedData.projects.map((project: any) => ({
      ...project,
      startDate: project.startDate ? normalizeDateToYYYYMM(project.startDate).normalized : '',
      endDate: project.endDate ? normalizeDateToYYYYMM(project.endDate).normalized : ''
    }));
  }

  // Normalize certification dates
  if (normalizedData.certifications) {
    normalizedData.certifications = normalizedData.certifications.map((cert: any) => ({
      ...cert,
      date: cert.date ? normalizeDateToYYYYMM(cert.date).normalized : ''
    }));
  }

  return normalizedData;
};
