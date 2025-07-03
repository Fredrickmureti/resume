
import { ResumeData } from '@/types/resume';

export const generateContextualResponse = (question: string, resumeData: ResumeData): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('internship') || lowerQuestion.includes('experience')) {
    return `For internship experience, focus on specific contributions and learnings. Here are some examples you could adapt:

• Collaborated with cross-functional teams to deliver projects on time and within scope
• Analyzed data and provided insights that led to process improvements
• Assisted in developing and implementing new procedures that increased efficiency by X%
• Gained hands-on experience with [relevant tools/technologies] while supporting team objectives

Remember to quantify your impact whenever possible and highlight transferable skills!`;
  }
  
  if (lowerQuestion.includes('cv') && lowerQuestion.includes('resume')) {
    return `Great question! Here are the key differences:

**Resume (US/Canada):**
• 1-2 pages maximum
• Focuses on relevant work experience
• Tailored to specific job applications
• Emphasizes achievements and impact

**CV (Europe/Academia):**
• Can be multiple pages
• Comprehensive career history
• Includes publications, research, conferences
• Used for academic and research positions

For most job applications in the US, stick with a resume format!`;
  }

  if (lowerQuestion.includes('quantify') || lowerQuestion.includes('achievements')) {
    return `To quantify your achievements, use numbers, data, and metrics to demonstrate the impact of your work. Instead of simply stating responsibilities, show how you exceeded expectations. For example:

**Instead of:** "Managed social media accounts"
**Try:** "Increased social media engagement by 25% through strategic content planning"

**Instead of:** "Helped with customer service"
**Try:** "Resolved 95% of customer inquiries within 24 hours, improving satisfaction scores"

Look for metrics like percentages, dollar amounts, time saved, or people impacted!`;
  }

  if (lowerQuestion.includes('summary') || lowerQuestion.includes('professional')) {
    const userName = resumeData.personalInfo.fullName || 'professional';
    const skills = resumeData.skills.length > 0 ? resumeData.skills.slice(0, 3).join(', ') : 'various technical skills';
    
    return `For your professional summary, focus on your unique value proposition. Based on your resume, here's a framework:

"${userName} is a [your role/title] with expertise in ${skills}. [Key achievement or experience]. Seeking to leverage [specific skills] to drive [relevant outcome] in [target industry]."

Keep it concise (2-3 sentences), achievement-focused, and tailored to your target role. Highlight what makes you unique!`;
  }
  
  return `I'd be happy to help you with that! Based on your resume, I can provide more specific advice. Could you tell me more about what particular aspect you'd like to focus on? For example:

• Writing better job descriptions
• Improving your professional summary
• Adding more impactful achievements
• Optimizing for specific roles

Feel free to ask me anything about resume writing, career advice, or job search strategies!`;
};
