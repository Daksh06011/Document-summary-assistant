const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class OCRProcessor {
  static async extractTextFromImage(filePath) {
    try {
      console.log('Starting OCR processing for:', filePath);

      // Read and resize image for faster OCR processing
      const imageBuffer = fs.readFileSync(filePath);
      const resizedBuffer = await sharp(imageBuffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      const result = await Tesseract.recognize(
        resizedBuffer,
        'eng', // English language
        {
          psm: 6, // Uniform block of text
          // Removed verbose logger to speed up processing
        }
      );

      const extractedText = result.data.text.trim();

      if (!extractedText || extractedText.length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      console.log('OCR completed successfully');
      return extractedText;

    } catch (error) {
      console.error('OCR processing error:', error);

      if (error.message.includes('Tesseract failed to load')) {
        throw new Error('OCR engine failed to initialize. Please try again.');
      }

      throw new Error(`Failed to process image with OCR: ${error.message}`);
    }
  }

  static async getSupportedLanguages() {
    try {
      const languages = await Tesseract.getLanguages();
      return languages;
    } catch (error) {
      console.error('Error getting supported languages:', error);
      return ['eng']; // Default to English
    }
  }

  static async getOCRProgress(filePath) {
    // This method can be used to track OCR progress in future implementations
    return {
      status: 'processing',
      progress: 0,
      file: path.basename(filePath)
    };
  }
}

module.exports = OCRProcessor;
