const pdf = require('pdf-parse');
const fs = require('fs');

class PDFParser {
  static async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }
      
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  static async getPDFMetadata(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        numPages: data.numpages,
        text: data.text,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('PDF metadata extraction error:', error);
      throw new Error(`Failed to extract PDF metadata: ${error.message}`);
    }
  }
}

module.exports = PDFParser;
