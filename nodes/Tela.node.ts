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
    description: 'Integrates with Tela to run AI-driven workflows and automation tasks',
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
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Canvas',
            value: 'canvas',
          },
        ],
        default: 'canvas',
        description: 'The resource to operate on',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['canvas'],
          },
        },
        options: [
          {
            name: 'Execute',
            value: 'execute',
            description: 'Execute a canvas with variables',
            action: 'Execute a canvas',
          },
          {
            name: 'Execute Workstation',
            value: 'executeWorkstation',
            description: 'Create a task in the workstation dashboard',
            action: 'Execute workstation task',
          },
          {
            name: 'Get Completion',
            value: 'getCompletion',
            description: 'Get the result of an async completion',
            action: 'Get completion status',
          },
        ],
        default: 'execute',
        description: 'The operation to perform',
      },
      {
        displayName: 'Project',
        name: 'projectId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getProjects',
        },
        displayOptions: {
          show: {
            resource: ['canvas'],
            operation: ['execute', 'executeWorkstation'],
          },
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
            resource: ['canvas'],
            operation: ['execute', 'executeWorkstation'],
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
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        description: 'Optional label for the workstation task',
        displayOptions: {
          show: {
            resource: ['canvas'],
            operation: ['executeWorkstation'],
            canvasId: [
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
            resource: ['canvas'],
            operation: ['execute', 'executeWorkstation'],
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
      {
        displayName: 'Async Execution',
        name: 'async',
        type: 'boolean',
        default: false,
        description: 'When enabled, the request returns immediately with the completion ID and status instead of waiting for the result',
        displayOptions: {
          show: {
            resource: ['canvas'],
            operation: ['execute'],
          },
        },
      },
      {
        displayName: 'Completion ID',
        name: 'completionId',
        type: 'string',
        default: '',
        required: true,
        description: 'The ID of the async completion to retrieve',
        displayOptions: {
          show: {
            resource: ['canvas'],
            operation: ['getCompletion'],
          },
        },
      },
    ],
  };

  methods = {
    loadOptions: {
      async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const apiService = new TelaApiService(this);

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

        const apiService = new TelaApiService(this);

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

        const apiService = new TelaApiService(this);

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

  private async processVariableValue(
    executeContext: IExecuteFunctions,
    value: any,
    apiService: TelaApiService,
    itemIndex: number,
  ): Promise<any> {
    try {
      const items = executeContext.getInputData();
      const item = items[itemIndex];

      let buffer: Buffer | null = null;
      let fileName = 'file';
      let mimeType = 'application/octet-stream';

      // Case 1: String with binary field name (e.g., "data", "file")
      // Uses n8n's official helper
      if (typeof value === 'string' && item.binary?.[value]) {
        const binaryMeta = item.binary[value];
        fileName = binaryMeta.fileName || fileName;
        mimeType = binaryMeta.mimeType || mimeType;
        buffer = await executeContext.helpers.getBinaryDataBuffer(itemIndex, value);
      }
      // Case 2: Binary object passed directly (e.g., {{ $binary.data }})
      // Already in memory, no need for helper
      else if (typeof value === 'object' && value?.data && typeof value.data === 'string') {
        fileName = value.fileName || fileName;
        mimeType = value.mimeType || mimeType;
        buffer = Buffer.from(value.data, 'base64');
      }
      // Case 3: Fallback - uses first available binary field (when value is not a useful string)
      else if (item.binary && Object.keys(item.binary).length > 0 && (value === '' || value === undefined || value === null)) {
        const binaryPropertyName = Object.keys(item.binary)[0];
        const binaryMeta = item.binary[binaryPropertyName];
        fileName = binaryMeta.fileName || fileName;
        mimeType = binaryMeta.mimeType || mimeType;
        buffer = await executeContext.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
      }

      // If binary data was found, upload it
      if (buffer) {
        const file = new File([buffer], fileName, { type: mimeType });
        const downloadUrl = await apiService.uploadFileAndGetDownloadUrl(file);
        return { file_url: downloadUrl };
      }

      // No binary data, return as string
      return String(value);
    } catch (error) {
      executeContext.logger.error('Error processing variable value, falling back to string', {
        error: error instanceof Error ? error.message : String(error),
        valueType: typeof value,
      });
      return String(value);
    }
  }

  private async processVariables(
    executeContext: IExecuteFunctions,
    variablesCollection: any,
    apiService: TelaApiService,
    itemIndex: number,
  ): Promise<Record<string, any>> {
    const processedVariables: Record<string, any> = {};

    if (variablesCollection?.variableValues && Array.isArray(variablesCollection.variableValues)) {
      for (const variableValue of variablesCollection.variableValues) {
        const { name, value } = variableValue;

        if (name) {
          // Always tries to process as binary first, falls back to string
          processedVariables[name] = await this.processVariableValue(
            executeContext,
            value,
            apiService,
            itemIndex,
          );
        }
      }
    }

    return processedVariables;
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const apiService = new TelaApiService(this);
    const telaInstance = new Tela();

    // Process each input item
    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;

        if (operation === 'getCompletion') {
          const completionId = this.getNodeParameter('completionId', i) as string;
          const data = await apiService.getCompletion(completionId);

          returnData.push({
            json: data,
            pairedItem: { item: i },
          });
        } else if (operation === 'executeWorkstation') {
          const canvasId = this.getNodeParameter('canvasId', i) as string;
          const variablesCollection = this.getNodeParameter('variables', i) as any;
          const label = this.getNodeParameter('label', i) as string;

          // Get application_id from prompt-application endpoint
          const promptApplications = await apiService.getPromptApplication(canvasId);
          if (!promptApplications || promptApplications.length === 0) {
            throw new Error(`No workstation application found for canvas ${canvasId}`);
          }
          const applicationId = promptApplications[0].id;

          // Process variables for this item
          const processedVariables = await telaInstance.processVariables(this, variablesCollection, apiService, i);

          // Create workstation task
          const data = await apiService.createWorkstationTask({
            application_id: applicationId,
            variables: processedVariables,
            ...(label && { label }),
          });

          returnData.push({
            json: data,
            pairedItem: { item: i },
          });
        } else {
          // execute operation
          const canvasId = this.getNodeParameter('canvasId', i) as string;
          const variablesCollection = this.getNodeParameter('variables', i) as any;
          const asyncExecution = this.getNodeParameter('async', i) as boolean;

          // Process variables for this item
          const processedVariables = await telaInstance.processVariables(this, variablesCollection, apiService, i);

          // Execute canvas completion
          const data = await apiService.createCompletion({
            canvas_id: canvasId,
            variables: processedVariables,
            ...(asyncExecution && { async: true }),
          });

          returnData.push({
            json: data,
            pairedItem: { item: i },
          });
        }

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