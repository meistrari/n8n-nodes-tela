import { Project, PromptDefinition, CompletionRequest, CompletionResponse } from './types';
import { TELA_API_BASE_URL, TELA_API_ENDPOINTS } from './constants';

export class TelaApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${TELA_API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjects(): Promise<Project[]> {
    return this.makeRequest<Project[]>(TELA_API_ENDPOINTS.PROJECTS);
  }

  async getPrompts(projectId: string): Promise<PromptDefinition[]> {
    const endpoint = `${TELA_API_ENDPOINTS.PROMPTS}?projectId=${projectId}&includeStats=false&includeLastVersion=true`;
    return this.makeRequest<PromptDefinition[]>(endpoint);
  }

  async getPromptById(promptId: string): Promise<PromptDefinition> {
    const endpoint = `${TELA_API_ENDPOINTS.PROMPTS}/${promptId}?includeLastVersion=true`;
    return this.makeRequest<PromptDefinition>(endpoint);
  }

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    return this.makeRequest<CompletionResponse>(TELA_API_ENDPOINTS.COMPLETIONS, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}