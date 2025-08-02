import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType
} from 'n8n-workflow';

import { TelaApiService } from './services/TelaApiService';

export class Tela implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Tela',
    name: 'tela',
    icon: 'file:tela.png',
    group: ['transform'],
    version: 1,
    description: 'Interage com a API Tela',
    defaults: {
      name: 'Tela',
      color: '#772244',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'telaApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Project',
        name: 'projectId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getProjects',
        },
        default: '',
        required: true,
        description: 'Select the project containing your canvas',
      },
      {
        displayName: 'Canvas',
        name: 'canvasId',
        type: 'options',
        typeOptions: {
          loadOptionsDependsOn: ['projectId'],
          loadOptionsMethod: 'getCanvases',
        },
        default: '',
        required: true,
        description: 'Select the canvas to execute',
        displayOptions: {
          show: {
            projectId: [
              {
                _cnd: {
                  exists: true,
                },
              },
            ],
          },
        },
      },
      {
        displayName: 'Variables',
        name: 'variables',
        type: 'collection',
        placeholder: 'Add Variable',
        default: {},
        description: 'Canvas variables - these will be populated dynamically based on the selected canvas',
        displayOptions: {
          show: {
            canvasId: [
              {
                _cnd: {
                  exists: true,
                },
              },
            ],
          },
        },
        options: [
          {
            displayName: 'Variable Name',
            name: 'name',
            type: 'options',
            typeOptions: {
              loadOptionsDependsOn: ['canvasId'],
              loadOptionsMethod: 'getVariables',
            },
            default: '',
            description: 'Select the variable to set',
          },
          {
            displayName: 'Input Type',
            name: 'inputType',
            type: 'options',
            options: [
              { name: 'Text', value: 'text' },
              { name: 'JSON', value: 'json' },
              { name: 'File', value: 'file' },
            ],
            default: 'text',
            description: 'How to interpret the input value',
          },
          {
            displayName: 'Value',
            name: 'value',
            type: 'string',
            default: '',
            description: 'The variable value',
            displayOptions: {
              show: {
                inputType: ['text'],
              },
            },
          },
          {
            displayName: 'JSON Value',
            name: 'value',
            type: 'json',
            default: '{}',
            description: 'The variable value as JSON',
            displayOptions: {
              show: {
                inputType: ['json'],
              },
            },
          },
          {
            displayName: 'File Path/Data',
            name: 'value',
            type: 'string',
            default: '',
            description: 'File path or binary data for file variables',
            displayOptions: {
              show: {
                inputType: ['file'],
              },
            },
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('telaApi')
        const apiService = new TelaApiService(credentials.apiKey as string);

        try {
          const projects = await apiService.getProjects();
          return projects.map(project => ({
            name: project.title,
            value: project.id,
          }));
        } catch (error) {
          throw new Error(`Failed to load projects: ${error}`);
        }
      },

      async getCanvases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const projectId = this.getCurrentNodeParameter('projectId') as string;
        if (!projectId) {
          return [];
        }

        const credentials = await this.getCredentials('telaApi')
        const apiService = new TelaApiService(credentials.apiKey as string);

        try {
          const prompts = await apiService.getPrompts(projectId);
          return prompts.map(prompt => ({
            name: prompt.title,
            value: prompt.id,
          }));
        } catch (error) {
          throw new Error(`Failed to load canvases: ${error}`);
        }
      },

      async getVariables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const canvasId = this.getCurrentNodeParameter('canvasId') as string;
        if (!canvasId) {
          return [];
        }

        const credentials = await this.getCredentials('telaApi')
        const apiService = new TelaApiService(credentials.apiKey as string);

        try {
          const prompt = await apiService.getPromptById(canvasId);
          const variables = prompt.lastVersion.variables || [];

          return variables.map(variable => ({
            name: `${variable.name} (${variable.type}${variable.required ? ', required' : ''})`,
            value: variable.name,
          }));
        } catch (error) {
          throw new Error(`Failed to load variables: ${error}`);
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const canvasId = this.getNodeParameter('canvasId', 0) as string;
    const variablesCollection = this.getNodeParameter('variables', 0) as any;
    const credentials = await this.getCredentials('telaApi')
    const apiService = new TelaApiService(credentials.apiKey as string);

    try {
      // Process variables based on their input types
      const processedVariables: Record<string, any> = {};

      if (variablesCollection && typeof variablesCollection === 'object') {
        for (const [key, varConfig] of Object.entries(variablesCollection)) {
          const config = varConfig as { name: string; inputType: string; value: any };

          if (config.name && config.value !== undefined) {
            switch (config.inputType) {
              case 'text':
                processedVariables[config.name] = String(config.value);
                break;
              case 'json':
                if (typeof config.value === 'string') {
                  // Convert JSON string format for Tela API
                  processedVariables[config.name] = config.value.replace(/"/g, "'");
                } else {
                  processedVariables[config.name] = JSON.stringify(config.value).replace(/"/g, "'");
                }
                break;
              case 'file':
                // For now, treat file as string - Phase 4 will implement actual file upload
                processedVariables[config.name] = String(config.value);
                break;
              default:
                processedVariables[config.name] = String(config.value);
            }
          }
        }
      }

      const data = await apiService.createCompletion({
        canvas_id: canvasId,
        variables: processedVariables,
      });

      return [this.helpers.returnJsonArray(data)];
    } catch (error) {
      throw new Error(`Failed to execute canvas: ${error}`);
    }
  }
}