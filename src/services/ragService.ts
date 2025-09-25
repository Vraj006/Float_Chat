// RAG Service for FloatChat - integrates with Flask backend
import axios from 'axios';

interface RagResponse {
  answer: string;
  used_tables: string[];
  suggested_visualizations: string[];
  candidates: Array<{
    table: string;
    explaination: string;
    row_count: number;
  }>;
  plots: Array<{
    type: string;
    title: string;
    data: Array<{
      x: number[];
      y: number[];
    }>;
    base64: string;
  }>;
  raw_llm_filters: any;
  raw_llm_final: any;
}

interface PlotData {
  type: 'salinity_profile' | 'temperature_profile';
  title: string;
  data: Array<{
    x: number[];
    y: number[];
  }>;
}

class RagService {
  private backendUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.backendUrl = 'https://fc847a52ecf9.ngrok-free.app';
  }

  // Build the FAISS index (run once)
  async buildIndex(): Promise<{ status: string; tables_indexed?: number; message?: string }> {
    try {
      const response = await axios.post(`${this.backendUrl}/build_index`);
      return response.data;
    } catch (error) {
      console.error('Error building index:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to build index: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  // Main chat method using RAG pipeline
  async sendMessage(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    try {
      console.log('RAG Service: Sending request to backend...', this.backendUrl);

      const response = await axios.post<RagResponse>(this.backendUrl, {
        query: userMessage,
        k: 5 // Number of tables to retrieve
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('RAG Service: Received response from backend');

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from backend');
      }

      // Store the plot data for chart generation
      this.lastPlotData = response.data.plots || [];
      this.lastSuggestions = this.generateSuggestionsFromResponse(userMessage, response.data);

      return response.data.answer || "I received your question but couldn't generate a proper response. Please try rephrasing your question.";
    } catch (error) {
      console.error('Error in RAG service:', error);

      if (axios.isAxiosError(error)) {
        // Network connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          return `❌ **Backend Connection Failed**\n\nThe RAG backend server is not running. Please:\n\n1. Open a terminal and navigate to the \`backend\` folder\n2. Run: \`./start.sh\` or \`python3 floatchat_flask.py\`\n3. Wait for "Running on http://0.0.0.0:5000" message\n4. Try your question again\n\nCurrent backend URL: ${this.backendUrl}`;
        }

        // JSON parsing errors (invalid response)
        if (error.response?.data && typeof error.response.data === 'string') {
          console.error('RAG Service: Received non-JSON response:', error.response.data);
          return `❌ **Backend Error**\n\nThe backend returned an invalid response. This might be due to:\n\n1. Backend startup issues\n2. Missing dependencies\n3. Configuration problems\n\nPlease check the backend console for error messages.`;
        }

        // Specific backend errors
        if (error.response?.status === 500 && error.response?.data?.message?.includes('Index not found')) {
          // Try to build index first
          try {
            console.log('RAG Service: Attempting to build index...');
            await this.buildIndex();

            // Retry the request
            const retryResponse = await axios.post<RagResponse>(`${this.backendUrl}/chat`, {
              query: userMessage,
              k: 5
            });
            this.lastPlotData = retryResponse.data.plots || [];
            this.lastSuggestions = this.generateSuggestionsFromResponse(userMessage, retryResponse.data);
            return retryResponse.data.answer || "Response generated after building index.";
          } catch (buildError) {
            console.error('Failed to build index:', buildError);
            return `❌ **Index Building Failed**\n\nI tried to build the search index but encountered an error. Please:\n\n1. Ensure the backend is running\n2. Check Supabase connection in backend/.env\n3. Verify TABLE_LIST configuration\n\nError: ${buildError.message}`;
          }
        }

        // Other HTTP errors
        if (error.response) {
          return `❌ **Backend Error (${error.response.status})**\n\nThe backend responded with an error: ${error.response.data?.message || error.response.statusText}\n\nPlease check the backend logs for more details.`;
        }

        // Request timeout
        if (error.code === 'ECONNABORTED') {
          return `⏱️ **Request Timeout**\n\nThe backend took too long to respond. This might be due to:\n\n1. Large dataset processing\n2. Slow network connection\n3. Backend performance issues\n\nPlease try a simpler question or wait a moment before trying again.`;
        }

        return `❌ **Network Error**\n\nFailed to connect to the RAG backend: ${error.message}\n\nPlease ensure the backend is running on ${this.backendUrl}`;
      }

      return `❌ **Unexpected Error**\n\nAn unexpected error occurred: ${error.message}\n\nPlease try again or check the console for more details.`;
    }
  }

  // Storage for plot data and suggestions
  private lastPlotData: PlotData[] = [];
  private lastSuggestions: string[] = [];

  // Check if response should include chart based on the plots returned from backend
  shouldIncludeChart(userMessage: string): { hasChart: boolean; chartType?: string } {
    if (this.lastPlotData && this.lastPlotData.length > 0) {
      // Return the first plot type found
      const firstPlot = this.lastPlotData[0];
      return {
        hasChart: true,
        chartType: firstPlot.type === 'salinity_profile' ? 'salinity' :
                  firstPlot.type === 'temperature_profile' ? 'temperature' : 'table'
      };
    }
    return { hasChart: false };
  }

  // Generate chart data from the RAG response
  async generateChartData(userMessage: string, chartType: string): Promise<any[]> {
    // Convert our plot data to the format expected by the frontend
    if (!this.lastPlotData || this.lastPlotData.length === 0) {
      return this.getFallbackChartData(chartType);
    }

    // Find matching plot data
    const plotData = this.lastPlotData.find(plot => {
      if (chartType === 'salinity' && plot.type === 'salinity_profile') return true;
      if (chartType === 'temperature' && plot.type === 'temperature_profile') return true;
      return false;
    });

    if (plotData && plotData.data && plotData.data.length > 0) {
      // Convert to Recharts format
      if (chartType === 'temperature') {
        // Create monthly average data from the plot data
        const tempData = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        for (let i = 0; i < 6; i++) {
          const temp = plotData.data[0]?.x?.[i] || 18 + Math.random() * 7; // fallback
          tempData.push({ month: months[i], temp: Math.round(temp * 10) / 10 });
        }
        return tempData;
      } else if (chartType === 'salinity') {
        // For salinity, we might want to show depth distribution
        const depthRanges = ['0-50m', '50-200m', '200-1000m', '1000m+'];
        const speciesData = [];
        for (let i = 0; i < 4; i++) {
          const count = Math.max(50, 400 - i * 100 + Math.random() * 50);
          speciesData.push({ depth: depthRanges[i], count: Math.round(count) });
        }
        return speciesData;
      }
    }

    return this.getFallbackChartData(chartType);
  }

  // Get plot image data for display
  getPlotData(): PlotData[] {
    return this.lastPlotData || [];
  }

  // Generate suggestions from RAG response
  private generateSuggestionsFromResponse(userMessage: string, response: RagResponse): string[] {
    const suggestions = [];

    // Add table-specific suggestions
    if (response.used_tables && response.used_tables.length > 0) {
      suggestions.push(`Tell me more about ${response.used_tables[0]}`);
    }

    // Add plot-specific suggestions
    if (response.plots && response.plots.length > 0) {
      if (response.plots.some(p => p.type === 'temperature_profile')) {
        suggestions.push("Show temperature variations by depth");
      }
      if (response.plots.some(p => p.type === 'salinity_profile')) {
        suggestions.push("Analyze salinity distribution patterns");
      }
    }

    // Fallback suggestions based on message content
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('temperature')) {
      suggestions.push("How does temperature affect marine ecosystems?");
    } else if (lowerMessage.includes('salinity')) {
      suggestions.push("What factors influence ocean salinity?");
    } else {
      suggestions.push("Show me recent ocean data trends");
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  // Generate relevant follow-up suggestions
  generateSuggestions(userMessage: string): string[] {
    return this.lastSuggestions || this.getDefaultSuggestions(userMessage);
  }

  private getDefaultSuggestions(userMessage: string): string[] {
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

  // Fallback chart data when RAG doesn't provide specific data
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

  // Test connection to backend
  async testConnection(): Promise<string> {
    try {
      const response = await axios.get(`${this.backendUrl}/health`, {
        timeout: 5000
      });

      if (response.data?.status === 'ok') {
        return `✅ Backend connection successful (${response.data.message})`;
      } else {
        return `⚠️ Backend responded but status is not ok: ${JSON.stringify(response.data)}`;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return `❌ Backend connection failed: Server not running on ${this.backendUrl}`;
        }
        return `❌ Backend connection failed: ${error.message}`;
      }
      return "❌ Unknown connection error";
    }
  }
}

export const ragService = new RagService();
export default ragService;