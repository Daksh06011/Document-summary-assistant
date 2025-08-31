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

    // Remove unwanted newlines before bullet points for better formatting
    const cleanedText = text.replace(/\n\s*[-*]\s/g, ' - ');

    // Improved prompts for better formatted summaries
    const lengthPrompts = {
      'short': `Create a concise summary in 2-3 sentences that captures the main topic and key points of the following text. Focus on the most important information and main conclusions.

Text to summarize:`,
      'medium': `Create a well-structured summary in clear, easy-to-read sections with bullet points and headings as follows:

## 📋 Summary Overview
[Provide a concise 2-3 sentence overview of the main topic, using simple language]

## 🔑 Key Points
- [Main point 1 explained simply]
- [Main point 2 explained simply]
- [Main point 3 explained simply]
- [Additional key points as needed]

## 🎯 Main Conclusions
[Summarize the primary conclusions or outcomes in 1-2 clear sentences]

Text to summarize:`,
      'long': `Create a comprehensive summary with the following structure:

## 📄 Document Summary

### Overview
[3-4 sentence overview of the entire document's purpose and main topic]

### Key Sections & Details
**Section 1:** [Name of first major section or topic]
• [Key point from this section]
• [Important detail or example]
• [Supporting information]

**Section 2:** [Name of second major section or topic]
• [Key point from this section]
• [Important detail or example]
• [Supporting information]

[Add more sections as needed based on document content]

### Important Findings
• [Critical finding or conclusion 1]
• [Critical finding or conclusion 2]
• [Critical finding or conclusion 3]

### Recommendations/Conclusions
[Final thoughts, recommendations, or overall conclusions from the document]

Text to summarize:`
    };

    const promptPrefix = lengthPrompts[length] || lengthPrompts['medium'];

    // Create an enhanced prompt for better summary quality
    const prompt = `${promptPrefix}${cleanedText}\n\nPlease ensure the summary is well-structured, coherent, and captures the essence of the content. If the text contains lists, tables, or structured information, preserve that structure in the summary. Summary:`;

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

    // Filter out very short sentences (less than 8 words) to improve precision
    const filteredSentences = sentences.filter(sentence => sentence.trim().split(/\s+/).length >= 8);

    // Sort sentences by word count (sentences with more words are likely more informative and precise)
    const sortedSentences = filteredSentences.sort((a, b) => {
      const wordsA = a.trim().split(/\s+/).length;
      const wordsB = b.trim().split(/\s+/).length;
      return wordsB - wordsA;
    });

    // Determine number of sentences based on summary length
    let numSentences;
    switch (length) {
      case 'short':
        numSentences = Math.min(2, sortedSentences.length);
        break;
      case 'medium':
        numSentences = Math.min(5, sortedSentences.length);
        break;
      case 'long':
        numSentences = Math.min(8, sortedSentences.length);
        break;
      default:
        numSentences = Math.min(5, sortedSentences.length);
    }

    // Return the selected sentences as bullet points
    const bulletPoints = sortedSentences.slice(0, numSentences).map(sentence => `- ${sentence.trim()}`);
    return bulletPoints.join('\n');
  }
}

module.exports = SummaryGenerator;
