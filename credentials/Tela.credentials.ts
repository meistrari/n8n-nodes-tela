import { IconFile, ICredentialType, INodeProperties, ICredentialTestRequest } from "n8n-workflow";

export class Tela implements ICredentialType {
  name = "telaApi";
  displayName = "Tela API";
  documentationUrl = "https://docs.tela.com";
  icon = "file:tela.png" as IconFile;
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      default: "",
      description: "Your Tela API key. You can find this in your Tela dashboard.",
      required: true,
    },
  ];

  // The block below tells how this credential can be tested
  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.tela.com',
      url: '/project',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {{ $credentials.apiKey }}',
        'Content-Type': 'application/json',
      },
    },
  };
}
