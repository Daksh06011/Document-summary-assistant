const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const PDFParser = require('../utils/pdfParser');
const OCRProcessor = require('../utils/ocrProcessor');
const SummaryGenerator = require('../utils/summaryGenerator');

const apiKey = process.env.GEMINI_API_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = new formidable.IncomingForm({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadDir: '/tmp',
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const file = files.document;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = file.filepath || file.path;
    const fileType = path.extname(file.originalFilename || file.name).toLowerCase();
    const summaryLength = fields.summaryLength || 'medium';

    try {
      let extractedText = '';

      if (fileType === '.pdf') {
        extractedText = await PDFParser.extractTextFromPDF(filePath);
      } else {
        extractedText = await OCRProcessor.extractTextFromImage(filePath);
      }

      const summaryGenerator = new SummaryGenerator(apiKey);
      const summary = await summaryGenerator.generateSummary(extractedText, summaryLength);

      // Clean up temporary file
      fs.unlinkSync(filePath);

      res.status(200).json({
        success: true,
        originalName: file.originalFilename || file.name,
        extractedText,
        summary,
        summaryLength,
      });
    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({ error: 'Failed to process document', message: error.message });
    }
  });
}
