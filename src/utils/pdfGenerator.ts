
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, Template } from '@/types/resume';

export const generatePDF = async (resumeData: ResumeData, template: Template): Promise<void> => {
  try {
    const element = document.getElementById('resume-preview');
    if (!element) {
      throw new Error('Resume preview element not found');
    }

    // Temporarily modify styles for better PDF output
    const originalStyle = element.style.cssText;
    element.style.cssText = `
      ${originalStyle}
      font-size: 16px !important;
      line-height: 1.5 !important;
      min-width: 794px !important;
      max-width: 794px !important;
      width: 794px !important;
      transform: scale(1) !important;
      page-break-inside: avoid !important;
    `;

    // Add page break controls to prevent splitting
    const textElements = element.querySelectorAll('*');
    const originalStyles: { element: Element; style: string }[] = [];
    
    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalStyles.push({ element: el, style: htmlEl.style.cssText });
      
      // Enhance text visibility
      if (window.getComputedStyle(htmlEl).fontSize) {
        const currentSize = parseFloat(window.getComputedStyle(htmlEl).fontSize);
        if (currentSize < 12) {
          htmlEl.style.fontSize = '12px';
        }
        if (currentSize > 24) {
          htmlEl.style.fontSize = '18px';
        }
      }
      
      // Ensure proper line spacing
      htmlEl.style.lineHeight = '1.4';
      
      // Add page break controls for section headers and content blocks
      if (htmlEl.tagName === 'H1' || htmlEl.tagName === 'H2' || htmlEl.tagName === 'H3') {
        htmlEl.style.pageBreakAfter = 'avoid';
        htmlEl.style.pageBreakInside = 'avoid';
        htmlEl.style.breakInside = 'avoid';
      }
      
      // Prevent breaking within project/experience/education items
      if (htmlEl.closest('.project-item') || 
          htmlEl.closest('.experience-item') || 
          htmlEl.closest('.education-item') ||
          htmlEl.classList.contains('project-item') ||
          htmlEl.classList.contains('experience-item') ||
          htmlEl.classList.contains('education-item')) {
        htmlEl.style.pageBreakInside = 'avoid';
        htmlEl.style.breakInside = 'avoid';
      }
      
      // Fix skill visibility issues
      if (htmlEl.classList.contains('skill') || htmlEl.closest('.skills-section')) {
        htmlEl.style.wordWrap = 'break-word';
        htmlEl.style.overflow = 'visible';
        htmlEl.style.whiteSpace = 'normal';
        htmlEl.style.pageBreakInside = 'avoid';
        htmlEl.style.breakInside = 'avoid';
      }
      
      // Ensure sections stay together
      if (htmlEl.tagName === 'SECTION' || htmlEl.classList.contains('resume-section')) {
        htmlEl.style.pageBreakInside = 'avoid';
        htmlEl.style.breakInside = 'avoid';
      }
    });

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Configure html2canvas with enhanced settings for better page handling
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-preview');
        if (clonedElement) {
          clonedElement.style.width = '794px';
          clonedElement.style.maxWidth = '794px';
          clonedElement.style.fontSize = '16px';
          
          // Apply page break styles to cloned elements
          const clonedTextElements = clonedElement.querySelectorAll('*');
          clonedTextElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            
            if (htmlEl.tagName === 'H1' || htmlEl.tagName === 'H2' || htmlEl.tagName === 'H3') {
              htmlEl.style.pageBreakAfter = 'avoid';
              htmlEl.style.pageBreakInside = 'avoid';
              htmlEl.style.breakInside = 'avoid';
            }
            
            if (htmlEl.closest('.project-item') || 
                htmlEl.closest('.experience-item') || 
                htmlEl.closest('.education-item') ||
                htmlEl.classList.contains('project-item') ||
                htmlEl.classList.contains('experience-item') ||
                htmlEl.classList.contains('education-item')) {
              htmlEl.style.pageBreakInside = 'avoid';
              htmlEl.style.breakInside = 'avoid';
            }
          });
        }
      },
      ignoreElements: (element) => {
        return element.classList?.contains('no-print') || false;
      }
    });

    // Restore original styles
    element.style.cssText = originalStyle;
    originalStyles.forEach(({ element, style }) => {
      (element as HTMLElement).style.cssText = style;
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create PDF with proper A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    
    // Calculate dimensions to maintain aspect ratio
    const canvasAspectRatio = canvas.height / canvas.width;
    let imgWidth = pdfWidth - (margin * 2);
    let imgHeight = imgWidth * canvasAspectRatio;
    
    // Position content
    const xOffset = margin;
    const yOffset = margin;
    
    // If content fits on one page
    if (imgHeight <= (pdfHeight - margin * 2)) {
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, '', 'FAST');
    } else {
      // Handle multi-page content with smart page breaks
      const pageHeight = pdfHeight - (margin * 2);
      let remainingHeight = imgHeight;
      let currentY = 0;
      let pageNum = 0;
      
      // Calculate optimal page break points to avoid splitting content
      const pageBreakBuffer = 15; // mm buffer to avoid splitting at edges

      while (remainingHeight > 0 && pageNum < 10) { // Increased page limit
        if (pageNum > 0) {
          pdf.addPage();
        }

        let currentPageHeight = Math.min(remainingHeight, pageHeight);
        
        // Adjust page height to avoid awkward splits
        if (remainingHeight > pageHeight && remainingHeight - pageHeight < pageBreakBuffer) {
          // If we're close to the end, extend current page slightly
          currentPageHeight = Math.min(remainingHeight, pageHeight + pageBreakBuffer);
        } else if (currentPageHeight > pageBreakBuffer && remainingHeight > currentPageHeight) {
          // Leave some buffer at the bottom to avoid splitting
          currentPageHeight = pageHeight - pageBreakBuffer;
        }

        const sourceY = (currentY / imgHeight) * canvas.height;
        const sourceHeight = (currentPageHeight / imgHeight) * canvas.height;

        // Create canvas for current page
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        if (pageCtx) {
          // Fill with white background
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, canvas.width, sourceHeight);
          
          pageCtx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, imgWidth, currentPageHeight, '', 'FAST');
        }

        currentY += currentPageHeight;
        remainingHeight -= currentPageHeight;
        pageNum++;
      }
    }

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = resumeData.personalInfo.fullName 
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume_${timestamp}.pdf`
      : `Resume_${timestamp}.pdf`;

    // Download the PDF
    pdf.save(fileName);
    
    console.log('PDF generated successfully with improved page break handling');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
