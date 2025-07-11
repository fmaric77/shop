export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  apiVersion: string;
  model: string;
  enabled: boolean;
}

export class AzureOpenAI {
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=${this.config.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test.' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.text();
        return { success: false, error: errorData };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=${this.config.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating text with Azure OpenAI:', error);
      throw error;
    }
  }

  async analyzeImage(imageBase64: string, prompt: string = "Please describe this image."): Promise<string> {
    try {
      const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=${this.config.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error analyzing image with Azure OpenAI:', error);
      throw error;
    }
  }

  async generateProductDescription(productData: any): Promise<string> {
    const prompt = `Generate a compelling product description for the following product:
Title: ${productData.title}
Price: $${productData.price}
Category: ${productData.category}
${productData.tags ? `Tags: ${productData.tags.join(', ')}` : ''}

Please create an engaging, SEO-friendly product description that highlights the key features and benefits. Keep it professional and persuasive.`;

    return this.generateText(prompt);
  }

  async generateTags(productData: any): Promise<string[]> {
    const prompt = `Generate relevant product tags/keywords for the following product:
Title: ${productData.title}
Description: ${productData.description}
Category: ${productData.category}
Price: $${productData.price}

Please provide 5-10 relevant tags separated by commas. Focus on searchable keywords that customers might use.`;

    const response = await this.generateText(prompt);
    return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  async improveSearchQuery(query: string, context: any = {}): Promise<string> {
    const prompt = `Improve this search query to get better product search results:
Original query: "${query}"
${context.category ? `Category context: ${context.category}` : ''}

Please provide an improved search query that would yield more relevant results in an e-commerce context.`;

    return this.generateText(prompt);
  }
}

// Singleton instance getter
let azureOpenAIInstance: AzureOpenAI | null = null;

export async function getAzureOpenAIInstance(): Promise<AzureOpenAI | null> {
  if (azureOpenAIInstance) {
    return azureOpenAIInstance;
  }

  try {
    // Import here to avoid circular dependencies
    const { default: connectDB } = await import('./mongodb');
    const { default: StoreSettings } = await import('../models/StoreSettings');
    
    await connectDB();
    
    // Fetch settings directly from database
    const settings = await StoreSettings.findOne({});
    
    if (!settings) {
      console.warn('No store settings found');
      return null;
    }

    const azureConfig = settings.ai?.azureOpenAI;

    if (!azureConfig?.enabled || !azureConfig?.apiKey || !azureConfig?.endpoint) {
      console.warn('Azure OpenAI is not properly configured');
      return null;
    }

    azureOpenAIInstance = new AzureOpenAI(azureConfig);
    return azureOpenAIInstance;
  } catch (error) {
    console.error('Error creating Azure OpenAI instance:', error);
    return null;
  }
}

// Alternative method that takes config directly (for server-side use)
export function createAzureOpenAIInstance(config: AzureOpenAIConfig): AzureOpenAI {
  return new AzureOpenAI(config);
}

// Reset instance (useful for settings updates)
export function resetAzureOpenAIInstance(): void {
  azureOpenAIInstance = null;
}
