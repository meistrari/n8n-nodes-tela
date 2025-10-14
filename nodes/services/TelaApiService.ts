import { Project, PromptDefinition, CompletionRequest, CompletionResponse, FileResponse, CanvasVariables } from './types';
import { TELA_API_BASE_URL, TELA_API_ENDPOINTS } from './constants';
import { IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';

export class TelaApiService {
  private apiKey: string;
  private httpRequest: (requestOptions: IHttpRequestOptions) => Promise<any>;

  constructor(apiKey: string, httpRequest: (requestOptions: IHttpRequestOptions) => Promise<any>) {
    this.apiKey = apiKey;
    this.httpRequest = httpRequest;
  }

  private async makeRequest<T>(endpoint: string, options?: { method?: IHttpRequestMethods; body?: any }): Promise<T> {
    const url = `${TELA_API_BASE_URL}${endpoint}`;

    const response = await this.httpRequest({
      method: options?.method || 'GET',
      url,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: options?.body,
      json: true,
    });

    return response as T;
  }

  async getProjects(): Promise<Project[]> {
    return this.makeRequest<Project[]>(TELA_API_ENDPOINTS.PROJECTS);
  }

  async getPrompts(projectId: string): Promise<PromptDefinition[]> {
    const endpoint = `${TELA_API_ENDPOINTS.PROMPTS}?projectId=${projectId}&includeStats=false&includeLastVersion=true`;
    return this.makeRequest<PromptDefinition[]>(endpoint);
  }

  async getCanvasVariables(canvasId: string): Promise<CanvasVariables> {
    const endpoint = `${TELA_API_ENDPOINTS.PROMPTS}/${canvasId}/promoted-version`;
    return this.makeRequest<CanvasVariables>(endpoint);
  }

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    return this.makeRequest<CompletionResponse>(TELA_API_ENDPOINTS.COMPLETIONS, {
      method: 'POST',
      body: request,
    });
  }

  async createUploadUrl(): Promise<FileResponse> {
    return this.makeRequest<FileResponse>(TELA_API_ENDPOINTS.FILES, {
      method: 'POST'
    });
  }

  async uploadFile(file: File, uploadUrl: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
    }
  }

  async uploadFileAndGetDownloadUrl(file: File): Promise<string> {
    const fileResponse = await this.createUploadUrl();

    await this.uploadFile(file, fileResponse.upload_url);

    return fileResponse.download_url;
  }
}