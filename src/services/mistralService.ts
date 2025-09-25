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
    console.log('Mistral API Key from env:', this.apiKey ? `Found (${this.apiKey.substring(0, 10)}...)` : 'Missing');
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
    return `You are FloatChat's ocean AI assistant. Be concise and scientific.

Rules:
- Keep responses under 100 words
- Focus on ocean/marine topics only
- Use bullet points, no tables or | | | formatting
- Include 1-2 relevant emojis
- Provide accurate oceanographic data
- Be engaging but brief

Format: Short paragraphs + bullet points when needed.`;
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
      // Remove table formatting (| | |) and convert to bullet points
      .replace(/^\|.*\|$/gm, '')
      .replace(/^\s*[-:]+\s*\|/gm, '')
      .replace(/\|/g, ' - ')
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
          model: 'mistral-large-latest',
          messages: messages,
          temperature: 0.5, // Lower for concise responses
          max_tokens: 150, // Much lower for short responses
          top_p: 0.9,
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
          // Check if this is a predefined question and provide fallback
          const fallbackResponse = this.getFallbackResponse(userMessage);
          if (fallbackResponse) {
            return fallbackResponse;
          }
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

    // Disabled table charts for presentation
    // if (lowerMessage.includes('zones') || lowerMessage.includes('regions') ||
    //     lowerMessage.includes('table') || lowerMessage.includes('comparison')) {
    //   return { hasChart: true, chartType: 'table' };
    // }

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
      console.warn('No Mistral API key available, using fallback data');
      return this.getFallbackChartData(chartType);
    }

    try {
      console.log(`Generating ${chartType} chart data for: ${userMessage}`);
      let prompt = '';

      if (chartType === 'temperature') {
        prompt = `Based on the user's question about "${userMessage}", generate realistic ocean temperature data for a line chart.

Context: This is for an oceanographic visualization showing temperature trends. Consider factors like:
- Geographic location (if mentioned)
- Seasonal variations
- Depth considerations
- Climate patterns
- Current ocean conditions

Return ONLY a valid JSON array with exactly 6 data points representing monthly ocean temperature data:
[{"month":"Jan","temp":18.5},{"month":"Feb","temp":19.2},{"month":"Mar","temp":20.1},{"month":"Apr","temp":21.8},{"month":"May","temp":23.4},{"month":"Jun","temp":25.1}]

Requirements:
- month: string (Jan, Feb, Mar, Apr, May, Jun)
- temp: number (realistic ocean temperature in Celsius, typically 12-30°C depending on location)
- Values should show realistic seasonal progression
- Consider the context of the user's question to make temperatures scientifically accurate

Return ONLY the JSON array, no additional text.`;

      } else if (chartType === 'species') {
        prompt = `Based on the user's question about "${userMessage}", generate realistic marine species distribution data for a bar chart.

Context: This shows biodiversity patterns in ocean depth zones. Consider:
- Marine biodiversity decreases with depth
- Surface waters (0-50m) have highest species count
- Deep sea (1000m+) has lowest species count
- Geographic location affects absolute numbers
- User's specific question context

Return ONLY a valid JSON array with exactly 4 data points:
[{"depth":"0-50m","count":342},{"depth":"50-200m","count":189},{"depth":"200-1000m","count":67},{"depth":"1000m+","count":23}]

Requirements:
- depth: string (exactly "0-50m", "50-200m", "200-1000m", "1000m+")
- count: number (realistic species count, should decrease with depth)
- Numbers should reflect the specific context of the user's question
- Consider geographic region if mentioned

Return ONLY the JSON array, no additional text.`;
      }

      if (!prompt) {
        console.log('No chart generation needed for this type');
        return this.getFallbackChartData(chartType);
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
            {
              role: 'system',
              content: 'You are an oceanographic data scientist. Generate realistic, scientifically accurate ocean data. Return ONLY valid JSON arrays as requested, with no additional text, formatting, or explanations.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1, // Very low for consistent data
          max_tokens: 100, // Much smaller for just JSON data
        }),
      });

      if (!response.ok) {
        console.error(`Mistral API error: ${response.status}`);
        throw new Error(`Failed to generate chart data: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();

      console.log('Raw Mistral response for chart data:', content);

      // Clean the response to extract JSON
      // Remove any markdown formatting
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
      // Remove any leading/trailing text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      // Parse the JSON response
      try {
        const chartData = JSON.parse(content);
        if (Array.isArray(chartData) && chartData.length > 0) {
          console.log(`Generated ${chartData.length} data points for ${chartType} chart`);
          return chartData;
        } else {
          console.warn('Invalid chart data structure from Mistral');
          return this.getFallbackChartData(chartType);
        }
      } catch (parseError) {
        console.warn('Failed to parse chart data from Mistral:', parseError);
        console.warn('Content was:', content);
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

  // Get fallback response for predefined questions when rate limited
  private getFallbackResponse(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('what affects ocean temperature')) {
      return `🌊 **Ocean Temperature Factors**

Key drivers:
• Solar radiation (primary heat source)
• Ocean currents (redistribute heat globally)
• Atmospheric circulation patterns
• Seasonal variations (winter/summer cycles)
• Geographic latitude (equator vs poles)
• Ocean depth (thermocline effects)

Current global average: ~17°C surface temperature 🌡️`;
    }

    if (lowerMessage.includes('marine biodiversity')) {
      return `🐠 **Marine Biodiversity Overview**

Ocean life distribution:
• Surface waters (0-200m): Highest diversity
• Coral reefs: 25% of marine species
• Deep sea (>1000m): Unique adaptations
• Polar regions: Specialized cold-water species
• Open ocean: Large migratory species

Estimated 2+ million marine species worldwide! 🌊`;
    }

    if (lowerMessage.includes('depth affect marine life')) {
      return `🏊 **Ocean Depth & Marine Life**

Depth zones:
• Sunlight zone (0-200m): Photosynthesis, highest life
• Twilight zone (200-1000m): Limited light, predators
• Midnight zone (1000-4000m): No light, bioluminescence
• Abyssal zone (4000m+): Extreme pressure adaptations

Each zone has unique species adapted to pressure, light, and temperature! 🌊`;
    }

    if (lowerMessage.includes('ocean current patterns')) {
      return `🌀 **Ocean Current Patterns**

Major systems:
• Gulf Stream: Warms North Atlantic
• Kuroshio Current: Pacific "Gulf Stream"
• Antarctic Circumpolar: Largest current system
• Thermohaline circulation: Global "conveyor belt"

Currents transport heat, nutrients, and marine life globally! 🌊`;
    }

    return null; // No fallback available
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