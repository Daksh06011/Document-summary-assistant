const { GoogleGenerativeAI } = require('@google/generative-ai');

class SummaryGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateSummary(text, length) {
    if (!text || text.trim().length === 0) {
      return 'No content to summarize.';
    }

    // Truncate text if it's too long for the API
    const maxTokens = 30000; // Leave some room for the prompt
    if (text.length > maxTokens) {
      text = text.substring(0, maxTokens);
    }

    // Map length to specific word count limits
    const lengthPrompts = {
      'short': 'Please provide a brief summary of the following text in approximately 100 words:\n\n',
      'medium': 'Please provide a moderate summary of the following text in approximately 150-200 words:\n\n',
      'long': 'Please provide a detailed summary of the following text in approximately 300 words:\n\n'
    };
    
    const promptPrefix = lengthPrompts[length] || lengthPrompts['medium'];

    // Create the prompt for the Gemini API
    const prompt = `${promptPrefix}${text}\n\nSummary:`;

    try {
      // Generate the summary using the Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      
      return summary.trim();
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      // Fallback to simple extraction if API fails
      return this.fallbackSummary(text, length);
    }
  }

  // Fallback method if the API fails
  fallbackSummary(text, length) {
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Determine number of sentences based on summary length
    let numSentences;
    switch (length) {
      case 'short':
        numSentences = Math.min(1, sentences.length);
        break;
      case 'medium':
        numSentences = Math.min(3, sentences.length);
        break;
      case 'long':
        numSentences = Math.min(5, sentences.length);
        break;
      default:
        numSentences = Math.min(3, sentences.length);
    }

    // Return the first few sentences as a simple summary
    return sentences.slice(0, numSentences).join(' ').trim();
  }
}

module.exports = SummaryGenerator;
