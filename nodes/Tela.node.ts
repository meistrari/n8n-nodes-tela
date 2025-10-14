import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

import { TelaApiService } from './services/TelaApiService';

export class Tela implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Tela',
    name: 'tela',
    icon: 'file:tela.svg',
    group: ['transform'],
    version: 1,
    description: 'Dynamic Tela API integration with auto-generated variable fields',
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
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        placeholder: 'Add Variable',
        default: [],
        description: 'Canvas variables - automatically populated based on selected canvas',
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
            name: 'variableValues',
            displayName: 'Variable Value',
            values: [
              {
                displayName: 'Variable',
                name: 'name',
                type: 'options',
                typeOptions: {
                  loadOptionsDependsOn: ['canvasId'],
                  loadOptionsMethod: 'getCanvasVariables',
                },
                default: '',
                required: true,
                description: 'Select the variable to set',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'The value for this variable',
                displayOptions: {
                  show: {
                    name: [
                      {
                        _cnd: {
                          exists: true,
                        },
                      },
                    ],
                  },
                },
              },

            ],
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('telaApi')
        const apiService = new TelaApiService(credentials.apiKey as string, this.helpers.httpRequest);

        try {
          const projects = await apiService.getProjects();
          const projectOptions = projects.map(project => ({
            name: project.title,
            value: project.id,
          }));

          return projectOptions;
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
        const apiService = new TelaApiService(credentials.apiKey as string, this.helpers.httpRequest);

        try {
          const prompts = await apiService.getPrompts(projectId);
          const canvasOptions = prompts.map(prompt => ({
            name: prompt.title,
            value: prompt.id,
          }));

          return canvasOptions;
        } catch (error) {
          throw new Error(`Failed to load canvases: ${error}`);
        }
      },

      async getCanvasVariables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const canvasId = this.getCurrentNodeParameter('canvasId') as string;
        if (!canvasId) {
          return [];
        }

        const credentials = await this.getCredentials('telaApi')
        const apiService = new TelaApiService(credentials.apiKey as string, this.helpers.httpRequest);

        try {
          const canvasVariables = await apiService.getCanvasVariables(canvasId);
          const variables = canvasVariables.variables || [];

          return variables.map(variable => {
            const requiredInfo = variable.required ? ' (required)' : '';

            return {
              name: `${variable.name} ${requiredInfo}`,
              value: variable.name,
              type: variable.type === 'file' ? 'file' : 'text',
              description: variable.description || `${variable.type} variable`,
            };
          });
        } catch (error) {
          throw new Error(`Failed to load canvas variables: ${error}`);
        }
      },
    },
  };

  private async processFileVariable(executeContext: IExecuteFunctions, value: any, apiService: TelaApiService, itemIndex: number): Promise<any> {
    try {
      const items = executeContext.getInputData();
      const item = items[itemIndex];

      let binaryData = null;
      let fileName = 'file';
      let mimeType = 'application/octet-stream';

      if (typeof value === 'string' && item.binary && item.binary[value]) {
        binaryData = item.binary[value];
        fileName = binaryData.fileName || fileName;
        mimeType = binaryData.mimeType || mimeType;
      }
      else if (typeof value === 'object' && value !== null && value.binary) {
        binaryData = value.binary;
        fileName = binaryData.fileName || fileName;
        mimeType = binaryData.mimeType || mimeType;
      }
      else if (typeof value === 'object' && value !== null && value.data) {
        binaryData = value;
        fileName = value.fileName || fileName;
        mimeType = value.mimeType || mimeType;
      }
      else if (typeof value === 'object' && value !== null && value.data && value.data.data) {
        binaryData = value.data;
        fileName = value.data.fileName || fileName;
        mimeType = value.data.mimeType || mimeType;
      }
      else if (item.binary && Object.keys(item.binary).length > 0) {
        const firstBinaryKey = Object.keys(item.binary)[0];
        binaryData = item.binary[firstBinaryKey];
        fileName = binaryData.fileName || fileName;
        mimeType = binaryData.mimeType || mimeType;
      }

      if (binaryData && binaryData.data) {
        const buffer = Buffer.from(binaryData.data, 'base64');
        const file = new File([buffer], fileName, { type: mimeType });
        const downloadUrl = await apiService.uploadFileAndGetDownloadUrl(file);
        return { file_url: downloadUrl };
      } else {
        return String(value);
      }
    } catch (fileError) {
      executeContext.logger.error('Error processing file variable, falling back to string value', {
        error: fileError instanceof Error ? fileError.message : String(fileError),
        valueType: typeof value,
      });
      return String(value);
    }
  }

  private async processVariables(executeContext: IExecuteFunctions, variablesCollection: any, canvasVariables: any[], apiService: TelaApiService, itemIndex: number): Promise<Record<string, any>> {
    const processedVariables: Record<string, any> = {};

    if (variablesCollection?.variableValues && Array.isArray(variablesCollection.variableValues)) {
      for (const variableValue of variablesCollection.variableValues) {
        const { name, value } = variableValue;

        if (name && value !== undefined && value !== '') {
          const variableDefinition = canvasVariables.find((v: any) => v.name === name);

          if (variableDefinition?.type === 'file') {
            processedVariables[name] = await this.processFileVariable(executeContext, value, apiService, itemIndex);
          } else {
            processedVariables[name] = String(value);
          }
        }
      }
    }

    return processedVariables;
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('telaApi');
    const apiService = new TelaApiService(credentials.apiKey as string, this.helpers.httpRequest);
    const telaInstance = new Tela();

    // Process each input item
    for (let i = 0; i < items.length; i++) {
      try {
        const canvasId = this.getNodeParameter('canvasId', i) as string;
        const variablesCollection = this.getNodeParameter('variables', i) as any;

        // Get canvas variables definition
        const canvasVariables = await apiService.getCanvasVariables(canvasId);
        const variables = canvasVariables.variables || [];

        // Process variables for this item
        const processedVariables = await telaInstance.processVariables(this, variablesCollection, variables, apiService, i);

        // Execute canvas completion
        const data = await apiService.createCompletion({
          canvas_id: canvasId,
          variables: processedVariables,
        });

        const content = data.choices[0].message?.content || {};

        // Add output with pairedItem linking
        returnData.push({
          json: content,
          pairedItem: { item: i },
        });

      } catch (error) {
        // Check if continueOnFail is enabled
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }

        // If continueOnFail is disabled, throw error
        throw new NodeOperationError(
          this.getNode(),
          `Failed to execute canvas: ${error instanceof Error ? error.message : String(error)}`,
          {
            itemIndex: i,
            description: 'Enable "Continue On Fail" in node settings to skip failed items',
          }
        );
      }
    }

    return [returnData];
  }
}