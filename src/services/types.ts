export interface Project {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Variable {
  description: string;
  required: boolean;
  name: string;
  type: string;
  processingOptions: {
    allowMultimodal: boolean;
  };
}

export interface StructuredOutput {
  enabled: boolean;
  schema: {
    properties: any;
    title: string;
    description: string;
    type: string;
    required: string[];
  };
}

export interface Configuration {
  model: string;
  type: string;
  temperature: number;
  structuredOutput: StructuredOutput;
}

export interface LastVersion {
  id: string;
  content: string;
  markdownContent: string | null;
  promptId: string;
  variables: Variable[];
  title: string;
  configuration: Configuration;
  promoted: boolean;
  draft: boolean;
  workspaceId: string;
  workflowSpec: string;
  isWorkflow: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PromptDefinition {
  id: string;
  title: string;
  projectId: string;
  inferencesPercentage: string;
  layoutVersion: string;
  workspaceId: string;
  createdBy: string;
  updatedBy: string;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastVersion: LastVersion;
}

export interface CompletionRequest {
  canvas_id: string;
  variables: Record<string, any>;
}

export interface CompletionResponse {
  [key: string]: any;
}