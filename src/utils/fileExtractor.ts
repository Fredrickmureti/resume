
// Utility functions for extracting text from different file types
export class FileExtractor {
  
  // Extract text from PDF files using pdf.js
  static async extractFromPDF(file: File): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      console.log('Extracted PDF text length:', fullText.length);
      return fullText.trim();
      
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw new Error('Failed to read PDF file. Please ensure it contains readable text.');
    }
  }

  // Extract text from DOC/DOCX files using mammoth
  static async extractFromDOC(file: File): Promise<string> {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages.length > 0) {
        console.log('Mammoth conversion messages:', result.messages);
      }
      
      console.log('Extracted DOC text length:', result.value.length);
      return result.value.trim();
      
    } catch (error) {
      console.error('Error extracting DOC:', error);
      throw new Error('Failed to read DOC/DOCX file. Please ensure the file is not corrupted.');
    }
  }

  // Extract text from plain text files
  static async extractFromText(file: File): Promise<string> {
    try {
      const text = await file.text();
      console.log('Extracted text file length:', text.length);
      return text.trim();
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file.');
    }
  }

  // Main extraction method that determines file type and extracts accordingly
  static async extractContent(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    console.log('Extracting content from:', fileName, 'Type:', fileType);
    
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return await this.extractFromPDF(file);
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
               fileType.includes('officedocument') || fileType.includes('msword')) {
      return await this.extractFromDOC(file);
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return await this.extractFromText(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.');
    }
  }
}
