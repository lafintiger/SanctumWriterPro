// Local providers (free, private)
export type LocalProviderType = 'ollama' | 'lmstudio';

// Cloud providers (Pro feature - requires API key)
export type CloudProviderType = 'openrouter' | 'openai' | 'anthropic' | 'google' | 'xai';

// All provider types
export type LLMProviderType = LocalProviderType | CloudProviderType;

// Helper to check if provider is cloud-based
export function isCloudProvider(provider: LLMProviderType): provider is CloudProviderType {
  return ['openrouter', 'openai', 'anthropic', 'google', 'xai'].includes(provider);
}

export interface LLMProvider {
  type: LLMProviderType;
  baseUrl: string;
  model: string;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProviderType;
  contextLength?: number;
  pricing?: {
    prompt: number;   // per 1M tokens
    completion: number; // per 1M tokens
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { 
      type: string; 
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
  done: boolean;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onToolCall: (toolCall: { name: string; arguments: Record<string, unknown> }) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

