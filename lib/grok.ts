interface GrokConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

interface GrokResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class GrokAI {
  private config: GrokConfig;

  constructor(config: GrokConfig) {
    this.config = config;
  }

  private async makeRequest(messages: any[], options: any = {}): Promise<GrokResponse> {
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Grok AI is not configured',
      };
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`;
        
        // Provide specific error messages for common status codes
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Grok API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before testing again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your API key permissions.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.choices[0]?.message?.content || '',
      };
    } catch (error) {
      console.error('Grok AI API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Public method to access makeRequest for custom prompts
  async makeCustomRequest(messages: any[], options: any = {}): Promise<GrokResponse> {
    return this.makeRequest(messages, options);
  }

  async generateProductDescription(productTitle: string, category: string, features: string[]): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a professional e-commerce copywriter. Generate compelling, SEO-friendly product descriptions that highlight key features and benefits. Keep descriptions concise but informative.',
      },
      {
        role: 'user',
        content: `Generate a product description for:
        Title: ${productTitle}
        Category: ${category}
        Features: ${features.join(', ')}
        
        Please provide a description that is engaging, highlights the key benefits, and would appeal to potential customers.`,
      },
    ];

    return this.makeRequest(messages, { maxTokens: 300 });
  }

  async generateProductRecommendations(userQuery: string, products: any[]): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful shopping assistant. Based on the user\'s query and available products, recommend the most suitable products and explain why they would be a good fit.',
      },
      {
        role: 'user',
        content: `User query: "${userQuery}"
        
        Available products:
        ${products.map(p => `- ${p.title} (${p.category?.name || 'No category'}) - $${p.price} - ${p.description || 'No description'}`).join('\n')}
        
        Please recommend the most suitable products and explain why they would be a good fit for the user's needs.`,
      },
    ];

    return this.makeRequest(messages, { maxTokens: 500 });
  }

  async improveSearchQuery(query: string): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a search optimization assistant. Given a user\'s search query, suggest better, more specific search terms that would help them find what they\'re looking for in an e-commerce store.',
      },
      {
        role: 'user',
        content: `Original search query: "${query}"
        
        Please suggest improved search terms or keywords that would help the user find more relevant products. Provide 3-5 alternative search suggestions.`,
      },
    ];

    return this.makeRequest(messages, { maxTokens: 200 });
  }

  async generateProductTags(productTitle: string, description: string, category: string): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a product categorization expert. Generate relevant tags/keywords for products that would help with search and organization.',
      },
      {
        role: 'user',
        content: `Product: ${productTitle}
        Description: ${description}
        Category: ${category}
        
        Please generate 5-10 relevant tags that would help customers find this product. Return only the tags, separated by commas.`,
      },
    ];

    return this.makeRequest(messages, { maxTokens: 100 });
  }

  async answerCustomerQuestion(question: string, productInfo: any): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful customer support assistant for an e-commerce store. Answer customer questions about products based on the available information. Be friendly, informative, and honest. If you don\'t have enough information, say so.',
      },
      {
        role: 'user',
        content: `Customer question: "${question}"
        
        Product information:
        ${JSON.stringify(productInfo, null, 2)}
        
        Please provide a helpful answer to the customer's question.`,
      },
    ];

    return this.makeRequest(messages, { maxTokens: 400 });
  }

  async testConnection(): Promise<GrokResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a test assistant. Respond with a simple confirmation message.',
      },
      {
        role: 'user',
        content: 'Please respond with "Connection successful" to test the API connection.',
      },
    ];

    return this.makeRequest(messages, { maxTokens: 50 });
  }
}

export async function getGrokInstance(): Promise<GrokAI | null> {
  try {
    // Determine base URL for internal requests
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/store-settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    
    const settings = await response.json();
    const grokConfig = settings.ai?.grok;
    
    if (!grokConfig?.apiKey) {
      return null;
    }
    
    return new GrokAI({
      apiKey: grokConfig.apiKey,
      model: grokConfig.model || 'grok-beta',
      enabled: grokConfig.enabled,
    });
  } catch (error) {
    console.error('Error creating Grok instance:', error);
    return null;
  }
}
