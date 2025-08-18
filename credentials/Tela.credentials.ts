import { IconFile, ICredentialType, INodeProperties } from "n8n-workflow";

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
}
