// Mistral AI API service for ocean-focused chatbot

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class MistralService {
  private apiKey: string;
  private apiUrl: string = 'https://api.mistral.ai/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
    console.log('Mistral API Key from env:', this.apiKey ? 'Found' : 'Missing');
    if (!this.apiKey) {
      console.warn('Mistral API key not found. Please set VITE_MISTRAL_API_KEY in your environment variables.');
    }
  }

  // Simple test function to verify API connectivity
  async testConnection(): Promise<string> {
    try {
      const response = await this.sendMessage("Hello, respond with just 'API working'");
      return response;
    } catch (error) {
      console.error('API test failed:', error);
      return `Test failed: ${error.message}`;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert ocean and marine science AI assistant for FloatChat, a professional oceanographic data platform. Your role is to:

1. Provide accurate, scientific information about oceans, marine life, and oceanographic data
2. Focus on topics like: ocean temperature, marine biodiversity, ocean currents, depth zones, climate change impacts, and oceanographic research
3. Use real scientific knowledge and cite reputable sources when possible
4. Keep responses informative but accessible to both professionals and enthusiasts
5. When discussing data, mention that FloatChat provides real-time ocean monitoring capabilities
6. If asked about non-ocean topics, politely redirect to marine science topics
7. Be concise but comprehensive - aim for responses that are informative yet easy to read

Format your responses with:
- Clear, structured information
- Use bullet points for lists
- Include relevant emojis sparingly for visual appeal
- Provide follow-up suggestions when appropriate

Remember: You represent a professional oceanographic platform, so maintain scientific accuracy while being engaging.`;
  }

  // Clean response text by removing markdown and special characters while preserving formatting
  private cleanResponseText(text: string): string {
    return text
      // Remove markdown headers (# ## ###) but keep the text on new lines
      .replace(/^#{1,6}\s*(.+)$/gm, '$1')
      // Remove bold/italic markers (**text** *text*) but keep the text
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      // Convert bullet points to clean bullets while preserving indentation
      .replace(/^(\s*)[-*+]\s*/gm, '$1• ')
      // Remove code blocks (```text```) but keep content
      .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
      // Remove inline code (`text`) but keep content
      .replace(/`([^`]+)`/g, '$1')
      // Remove links [text](url) but keep the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Keep line breaks and paragraph spacing
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async sendMessage(userMessage: string, conversationHistory: MistralMessage[] = []): Promise<string> {
    console.log('Mistral API - Starting request for:', userMessage);

    if (!this.apiKey) {
      console.error('Mistral API key is missing');
      // Return a test response instead of throwing error for debugging
      return `I received your message: "${userMessage}". However, the Mistral API key is not configured properly. Please check your environment variables.`;
    }

    console.log('Mistral API key available:', this.apiKey.substring(0, 10) + '...');

    try {
      const messages: MistralMessage[] = [
        { role: 'system', content: this.getSystemPrompt() },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest', // Using the latest and most capable model
          messages: messages,
          temperature: 0.7, // Balanced between creativity and accuracy
          max_tokens: 1000, // Reasonable limit for chat responses
          top_p: 1,
          stream: false
        }),
      });

      console.log('Mistral API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mistral API error details:', errorData);
        throw new Error(`Mistral API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data: MistralResponse = await response.json();
      console.log('Mistral API response received, choices count:', data.choices?.length);

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from Mistral API');
      }

      // Clean the response text before returning
      const rawResponse = data.choices[0].message.content;
      console.log('Mistral API raw response length:', rawResponse.length);
      const cleanedResponse = this.cleanResponseText(rawResponse);
      console.log('Mistral API response cleaned successfully');
      return cleanedResponse;

    } catch (error) {
      console.error('Mistral API error details:', error);

      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Return detailed error information for debugging
        if (error.message.includes('API key')) {
          return `API Configuration Issue: ${error.message}. Please check your VITE_MISTRAL_API_KEY environment variable.`;
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          return `Network connectivity issue: ${error.message}. Please check your internet connection and try again.`;
        } else if (error.message.includes('401')) {
          return `Authentication failed: Invalid API key. Please check your Mistral API key is correct.`;
        } else if (error.message.includes('429')) {
          return `Rate limit exceeded: Too many requests. Please wait a moment and try again.`;
        } else {
          return `API Error (${error.message}): Please try rephrasing your question or try again later.`;
        }
      }

      return `Unknown error occurred. Please try again later.`;
    }
  }

  // Helper method to determine if a message should include chart data
  shouldIncludeChart(userMessage: string): { hasChart: boolean; chartType?: string } {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('zones') || lowerMessage.includes('regions') ||
        lowerMessage.includes('table') || lowerMessage.includes('comparison')) {
      return { hasChart: true, chartType: 'table' };
    }

    if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
      return { hasChart: true, chartType: 'temperature' };
    }

    if (lowerMessage.includes('species') || lowerMessage.includes('biodiversity') ||
        lowerMessage.includes('marine life') || lowerMessage.includes('depth')) {
      return { hasChart: true, chartType: 'species' };
    }

    return { hasChart: false };
  }

  // Generate chart data using Mistral API
  async generateChartData(userMessage: string, chartType: string): Promise<any[]> {
    if (!this.apiKey) {
      // Return fallback data if API is not available
      return this.getFallbackChartData(chartType);
    }

    try {
      let prompt = '';

      if (chartType === 'table') {
        prompt = `Based on the user's question about "${userMessage}", generate realistic ocean data in table format.

Return ONLY a JSON array where each object represents a table row with 3 columns. Format should be:
- column1: string (first column data like zone names, regions, etc.)
- column2: string (second column data like temperature ranges, depths, etc.)
- column3: string (third column data like descriptions, features, characteristics, etc.)

Example format: [{"column1":"Tropical Zone","column2":"25-30°C","column3":"High biodiversity and coral reefs"}...]

Generate 4-6 realistic data rows that scientifically answer the user's question about ocean zones, regions, or comparisons.`;
      } else if (chartType === 'temperature') {
        prompt = `Based on the user's question about "${userMessage}", generate realistic ocean temperature data for visualization.

Return ONLY a JSON array with exactly 6 data points representing monthly ocean temperature averages. Each point should have:
- month: string (Jan, Feb, Mar, Apr, May, Jun)
- temp: number (realistic ocean temperature in Celsius, typically 15-25°C for surface waters)

Example format: [{"month":"Jan","temp":18.5},{"month":"Feb","temp":19.2}...]

Make the data scientifically realistic and relevant to the user's question about ocean temperatures.`;
      } else if (chartType === 'species') {
        prompt = `Based on the user's question about "${userMessage}", generate realistic marine species distribution data by depth zones.

Return ONLY a JSON array with exactly 4 data points representing species count by depth zone:
- depth: string (depth zone like "0-50m", "50-200m", "200-1000m", "1000m+")
- count: number (realistic species count, decreasing with depth)

Example format: [{"depth":"0-50m","count":342},{"depth":"50-200m","count":189}...]

Make the data scientifically realistic showing how biodiversity generally decreases with ocean depth.`;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: 'You are a data scientist specializing in oceanographic data. Return only valid JSON arrays as requested, no additional text or formatting.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3, // Lower temperature for more consistent data generation
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart data');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the JSON response
      try {
        const chartData = JSON.parse(content);
        return Array.isArray(chartData) ? chartData : this.getFallbackChartData(chartType);
      } catch (parseError) {
        console.warn('Failed to parse chart data from Mistral:', parseError);
        return this.getFallbackChartData(chartType);
      }

    } catch (error) {
      console.error('Error generating chart data:', error);
      return this.getFallbackChartData(chartType);
    }
  }

  // Fallback chart data when API is unavailable
  private getFallbackChartData(chartType: string): any[] {
    if (chartType === 'table') {
      return [
        { column1: 'Tropical Zone (30°S–30°N)', column2: '25–30°C (77–86°F)', column3: 'Warmest waters; high evaporation drives hurricanes/typhoons.' },
        { column1: 'Subtropical Zone (30°–50°)', column2: '15–25°C (59–77°F)', column3: 'Transition zone; strong temperature gradients (e.g., Gulf Stream).' },
        { column1: 'Temperate Zone (50°–60°)', column2: '5–15°C (41–59°F)', column3: 'Seasonal variability; upwelling brings cold, nutrient-rich water.' },
        { column1: 'Polar Zone (>60°)', column2: '-2–5°C (28–41°F)', column3: 'Near-freezing; ice formation regulates global circulation.' }
      ];
    } else if (chartType === 'temperature') {
      return [
        { month: 'Jan', temp: 18.5 }, { month: 'Feb', temp: 19.2 },
        { month: 'Mar', temp: 20.1 }, { month: 'Apr', temp: 21.8 },
        { month: 'May', temp: 23.4 }, { month: 'Jun', temp: 25.1 }
      ];
    } else if (chartType === 'species') {
      return [
        { depth: '0-50m', count: 342 }, { depth: '50-200m', count: 189 },
        { depth: '200-1000m', count: 67 }, { depth: '1000m+', count: 23 }
      ];
    }
    return [];
  }

  // Generate relevant follow-up suggestions based on the conversation
  generateSuggestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('temperature')) {
      return [
        "How does ocean temperature affect marine ecosystems?",
        "Show me temperature variations by depth",
        "What causes ocean temperature changes?"
      ];
    }

    if (lowerMessage.includes('biodiversity') || lowerMessage.includes('species')) {
      return [
        "Which ocean zones have the most biodiversity?",
        "How does depth affect marine species?",
        "What threatens ocean biodiversity?"
      ];
    }

    if (lowerMessage.includes('current')) {
      return [
        "How do ocean currents affect global climate?",
        "What drives major ocean circulation patterns?",
        "How do currents transport marine life?"
      ];
    }

    // Default suggestions
    return [
      "Tell me about ocean temperature patterns",
      "How does marine life adapt to different depths?",
      "What are the effects of climate change on oceans?"
    ];
  }
}

export const mistralService = new MistralService();
export default mistralService;