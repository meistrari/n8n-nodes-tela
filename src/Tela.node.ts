import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

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
        displayName: 'Canvas ID',
        name: 'canvasId',
        type: 'string',
        default: '',
        placeholder: 'O canvas ID pode ser encontrado no link do canvas ou na sessão de "Connect via API"',
        description: 'ID do canvas no Tela',
      },
      {
        displayName: 'Payload',
        name: 'payload',
        type: 'string',
        default: '',
        placeholder: 'Input do canvas',
        description: '',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const canvasId = this.getNodeParameter('canvasId', 0) as string;
    const payload = this.getNodeParameter('payload', 0) as string;
    const credentials = await this.getCredentials('telaApi');
    const apiKey = credentials!.apiKey as string;

    const response = await fetch('https://api.tela.com/v2/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        canvas_id: canvasId,
        variables: {
          payload: payload,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return [this.helpers.returnJsonArray(data)];
  }
}