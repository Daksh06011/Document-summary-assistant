# Document Summary Assistant

A web application that extracts text from PDFs and images using OCR technology, then generates smart summaries. Built with Node.js, Express, and modern web technologies.

## 🚀 Features

- **Document Upload**: Support for PDF files and various image formats (PNG, JPG, JPEG, TIFF, BMP, GIF)
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Text Extraction**: 
  - PDF parsing with formatting preservation
  - OCR (Optical Character Recognition) for image files using Tesseract.js
- **Smart Summarization**: AI-powered summaries using Google's Gemini API with customizable length options
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during processing

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Processing**: pdf-parse library
- **OCR**: Tesseract.js
- **Summary Generation**: AI-powered summarization using Google's Gemini API
- **File Upload**: Multer middleware
- **Styling**: Custom CSS with responsive design

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-summary-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
document-summary-assistant/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   └── script.js           # Frontend JavaScript
├── utils/
│   ├── pdfParser.js        # PDF text extraction
│   ├── ocrProcessor.js     # Image OCR processing
│   └── summaryGenerator.js # Implements AI-powered summary generation using Google's Gemini API
├── uploads/                # Temporary file storage
├── server.js              # Express server
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## 🎯 Usage

1. **Upload Document**: Drag and drop a PDF or image file, or click to browse
2. **Select Summary Length**: Choose from short, medium, or long summary options
3. **Process**: Click "Process Document" to extract text and generate summary
4. **View Results**: See the extracted text and generated summary

## 🔧 API Endpoints

- `POST /api/upload` - Process document upload and generate summary
  - Body: FormData with 'document' file and 'summaryLength' parameter
  - Response: JSON with extracted text and summary

## 🎨 Summary Generation Algorithm

The application now uses Google's Gemini API for summarization, which provides more accurate and contextually relevant summaries:
- **Short**: Returns a brief, concise summary
- **Medium**: Returns a balanced summary with key points
- **Long**: Returns a detailed summary with comprehensive coverage of the content

The AI-powered approach considers the context, relevance, and coherence of the content to generate high-quality summaries.

## 🌐 Deployment

The application can be deployed to various platforms:

**Netlify/Vercel**: 
- Build command: `npm run build`
- Output directory: `public/`
- Environment: Node.js

**Heroku**:
- Add `Procfile` with: `web: node server.js`
- Set environment variables if needed

## 🐛 Troubleshooting

**Common Issues:**
1. **File upload fails**: Check file size (max 10MB) and format
2. **OCR not working**: Tesseract.js may take time to initialize first time
3. **Text extraction issues**: Some PDFs/images may have poor quality text

**Solutions:**
- Ensure files are clear and readable
- Try different file formats if OCR fails
- Check browser console for detailed error messages

## 📝 License

MIT License - feel free to use this project for learning and development purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.