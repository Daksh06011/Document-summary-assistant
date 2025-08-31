const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pdfParser = require('./utils/pdfParser');
const ocrProcessor = require('./utils/ocrProcessor');
const SummaryGenerator = require('./utils/summaryGenerator');
const apiKey = process.env.GEMINI_API_KEY; // Assuming the API key is stored in an environment variable

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    const summaryLength = req.body.summaryLength || 'medium';

    let extractedText = '';

    // Process file based on type
    if (fileType === '.pdf') {
      extractedText = await pdfParser.extractTextFromPDF(filePath);
    } else {
      // Image file - use OCR
      extractedText = await ocrProcessor.extractTextFromImage(filePath);
    }

    // Generate summary
    const summaryGenerator = new SummaryGenerator(apiKey);
    const summary = await summaryGenerator.generateSummary(extractedText, summaryLength);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      originalName: req.file.originalname,
      extractedText: extractedText,
      summary: summary,
      summaryLength: summaryLength
    });

  } catch (error) {
    console.error('Error processing file:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to process document',
      message: error.message
    });
  }
});

// 404 Error handling
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: 'The requested API endpoint does not exist'
  });
});

app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(400).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});
